var content = require("../models/content");
var comment = require("../models/comment");


//all middleware goes here

var middlewareObj= {};

middlewareObj.isLoggedIn = function(req,res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","please log in.");
    res.redirect("/login");
}

middlewareObj.checkContentOwnership = function(req,res,next){
    if(req.isAuthenticated()){
       content.findById(req.params.id, function(err,foundPost){
           if(err){
               req.flash("error","Post not found");
               res.redirect("back");
           }else{
               if(foundPost.author.id.equals(req.user._id)){
                   next();
               }
               else{
                   req.flash("error","you don't have the permission to do this action.");
                   res.redirect("back");
               }
           }
       });
    }
    else{
        req.flash("error","you must be login to take that action");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        comment.findById(req.params.comment_id, function(err,foundComment){
          if(err){
              req.flash("error", "Comment not found");
              res.redirect("back");
          }
           else{
               if(foundComment.author.id.equals(req.user._id)){
                   next();
               }
               else{
                   req.flash("error","permission denied");
                   res.redirect("back");
               }
           }
        });
    }else{
        req.flash("error","please log in");
        res.redirect("back");
    }
};



module.exports= middlewareObj;
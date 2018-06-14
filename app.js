var express = require("express"),
    mongoose= require("mongoose"),
    passport= require("passport"),
    localStrategy= require("passport-local"),
    passportLocalMongoose= require("passport-local-mongoose"),
    bodyParser= require("body-parser"),
    methodOverride= require("method-override"),
     flash= require("connect-flash")

var app = express();


mongoose.connect("mongodb://localhost/cinephile");

app.use(flash());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

var User = require("./models/user");
var content = require("./models/content");
var comment = require("./models/comment");

var middleware = require("./middleware/index.js");

app.use(require("express-session")({
    secret: "this is the secret CIA",
    resave: true,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();

});


//hardcoded data
// content.create({
//   title:"hello world",
//   body:"hiii"  
// });





//routes

//index route
app.get("/", function(req,res){
  content.find({}, function(err,contents){
      if(err){
          console.log(err);
      }
      else{
        res.render("index", {contents:contents});
      }

  });
  
});


//new route
app.get("/new",middleware.isLoggedIn, function (req, res) {
    res.render("new");
});


//create route
app.post("/",middleware.isLoggedIn, function(req,res){
    var title = req.body.content.title;
    var body = req.body.content.body;
    var author = {
        id: req.user._id,

        username: req.user.username
    };
    var newlyContent= {title:title, body:body, author:author };
 content.create(newlyContent, function(err,newcontent){
     if(err){
         console.log(err);
     }
     else{
         res.redirect("/");
     }
 });
});

//show route
app.get("/post/:id",function(req,res){
    content.findById(req.params.id).populate("comments").exec (function(err,foundPost){
       if(err){
           res.redirect("/");
       }
       else{
           res.render("show",{foundPost:foundPost});
       }
   }) ;
});

//delete route
app.delete("/post/:id",middleware.checkContentOwnership, function(req,res){
    content.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/post/<%=content._id%>")
        }
        else{
            res.redirect("/");
        }
    });
});

//edit route
app.get("/post/:id/edit", middleware.checkContentOwnership, function(req,res){
content.findById(req.params.id, function(err,foundpost){
    if(err){
        res.redirect("/post/<%=content._id%>");
    }
    else{
        res.render("edit",{foundpost:foundpost})
    }
})
});


//update route
app.put("/post/:id", middleware.checkContentOwnership, function (req, res) {
    content.findByIdAndUpdate(req.params.id,req.body.content, function(err){
        if(err){
            res.redirect("post/:id/edit")
        }
        else{
            res.redirect("/post/"+ req.params.id);
        }
    })
})


//comments routes

//new  and show comments

app.get("/post/:id/comment/new",middleware.isLoggedIn, function(req,res){
content.findById(req.params.id,function(err,foundPost){
    if(err){
        console.log(err);
    }
    else{
       res.render("new_comment",{foundPost:foundPost});
    }
})

});

app.post("/post/:id/comment", middleware.isLoggedIn ,function(req,res){
    content.findById(req.params.id,function(err,foundPost){
        if(err){
            console.log(err);
        }
        else{
          comment.create(req.body.comment, function(err,comment){
          if(err){
              console.log(err);
          }
          else{
              //add username and id in comment mode
              comment.author.id = req.user._id;
              comment.author.username = req.user.username;
             //save comment
             comment.save();
             foundPost.comments.push(comment);
             foundPost.save();
             res.redirect("/post/"+ foundPost._id);


          }

          });
        }
    });
});

// edit and update comment

app.get("/post/:id/comment/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    comment.findById(req.params.comment_id,function(err, foundComment){
      if(err){
          console.log(err);
      }
      else{
          content.findById(req.params.id, function(err,foundPost){
              if(err){
                 console.log(err)
              }
              else{
               res.render("comment_edit", {
                   foundPost: foundPost,
                   comment: foundComment
               });
              }
      });
          
      }
    });
});


app.put("/post/:id/comment/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    comment.findByIdAndUpdate(req.params.comment_id, req.body.comment,function(err,updatedComment){
     if(err){
         console.log(err)
     }
     else{
         res.redirect("/post/" + req.params.id);
     }
    }); 
});

//comment destroy

app.delete("/post/:id/comment/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    comment.findByIdAndRemove(req.params.comment_id,function(err){
          if(err){
              console.log(err)
          }
          else{
              res.redirect("/post/" + req.params.id);
          }
    
});
});




//auth routes

//signup
app.get("/signup", function (req, res) {
    res.render("signup");
})

app.post("/signup", function(req,res){
  User.register(new User({username:req.body.username}),req.body.password, function(err,user){
      if(err){
          console.log(err);
          return res.render("signup");
      }
      
          passport.authenticate("local")(req,res,function(){
              res.redirect("/");
          })
      
  })  
})


//login
app.get("/login", function (req, res) {
    res.render("login");
})

app.post("/login",passport.authenticate("local",{
    successRedirect:"/",
    faliureRedirect:"/login"
}),
function(req,res){

});

//logout

app.get("/logout", function(req,res){
    req.logout();
    res.redirect("/");

})





app.listen(process.env.PORT||3000,process.env.IP, function(){
    console.log("cinephile server has started");
})

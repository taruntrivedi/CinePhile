var express = require("express"),
    router = express.Router(),
    content = require("../models/content"),
    comment = require("../models/comment"),
    middleware = require("../middleware")


//comments routes

//new  and show comments

router.get("/post/:id/comment/new", middleware.isLoggedIn, function (req, res) {
    content.findById(req.params.id, function (err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            res.render("new_comment", {
                foundPost: foundPost
            });
        }
    })

});

router.post("/post/:id/comment", middleware.isLoggedIn, function (req, res) {
    content.findById(req.params.id, function (err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    //add username and id in comment mode
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    foundPost.comments.push(comment);
                    foundPost.save();
                    res.redirect("/post/" + foundPost._id);


                }

            });
        }
    });
});

// edit and update comment

router.get("/post/:id/comment/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            console.log(err);
        } else {
            content.findById(req.params.id, function (err, foundPost) {
                if (err) {
                    console.log(err)
                } else {
                    res.render("comment_edit", {
                        foundPost: foundPost,
                        comment: foundComment
                    });
                }
            });

        }
    });
});


router.put("/post/:id/comment/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/post/" + req.params.id);
        }
    });
});

//comment destroy

router.delete("/post/:id/comment/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    comment.findByIdAndRemove(req.params.comment_id, function (err) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/post/" + req.params.id);
        }

    });
});

module.exports = router;
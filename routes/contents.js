var express = require("express"),
    router = express.Router(),
    content = require("../models/content"),
    comment = require("../models/comment"),
    middleware = require("../middleware/index.js")

//routes

//index route
router.get("/", function (req, res) {
    content.find({}, function (err, contents) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {
                contents: contents
            });
        }

    });

});


//new route
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("new");
});


//create route
router.post("/", middleware.isLoggedIn, function (req, res) {
    var title = req.body.content.title;
    var body = req.body.content.body;
    var image= req.body.content.image;
    var author = {
        id: req.user._id,

        username: req.user.username
    };
    var newlyContent = {
        title: title,
        body: body,
        image:image,
        author: author
    };
    content.create(newlyContent, function (err, newcontent) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
});

//show route
router.get("/post/:id", function (req, res) {
    content.findById(req.params.id).populate("comments").exec(function (err, foundPost) {
        if (err) {
            res.redirect("/");
        } else {
            res.render("show", {
                foundPost: foundPost
            });
        }
    });
});

//delete route
router.delete("/post/:id", middleware.checkContentOwnership, function (req, res) {
    content.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            res.redirect("/post/<%=content._id%>")
        } else {
            res.redirect("/");
        }
    });
});

//edit route
router.get("/post/:id/edit", middleware.checkContentOwnership, function (req, res) {
    content.findById(req.params.id, function (err, foundpost) {
        if (err) {
            res.redirect("/post/<%=content._id%>");
        } else {
            res.render("edit", {
                foundpost: foundpost
            })
        }
    })
});


//update route
router.put("/post/:id", middleware.checkContentOwnership, function (req, res) {
    content.findByIdAndUpdate(req.params.id, req.body.content, function (err) {
        if (err) {
            res.redirect("post/:id/edit")
        } else {
            res.redirect("/post/" + req.params.id);
        }
    })
})

module.exports = router;
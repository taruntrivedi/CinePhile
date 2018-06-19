var express = require("express"),
    router = express.Router(),
    content = require("../models/content"),
    comment = require("../models/comment"),
    passport = require("passport"),
    User = require("../models/user")


//auth routes

//signup
router.get("/signup", function (req, res) {
    res.render("signup");
})

router.post("/signup", function (req, res) {
    User.register(new User({
        username: req.body.username
    }), req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            return res.render("signup");
        }

        passport.authenticate("local")(req, res, function () {
            res.redirect("/");
        })

    })
})


//login
router.get("/login", function (req, res) {
    res.render("login");
})

router.post("/login", passport.authenticate("local", {
        successRedirect: "/",
        faliureRedirect: "/login"
    }),
    function (req, res) {

    });

//logout

router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");

})


module.exports = router;
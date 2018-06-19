var express = require("express"),
    mongoose= require("mongoose"),
    passport= require("passport"),
    localStrategy= require("passport-local"),
    passportLocalMongoose= require("passport-local-mongoose"),
    bodyParser= require("body-parser"),
    methodOverride= require("method-override"),
     flash= require("connect-flash")

var app = express();


var User = require("./models/user");
var content = require("./models/content");
var comment = require("./models/comment");

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


app.use(flash());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride("_method"));

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();

});

var commentRoutes= require("./routes/comments"),
    contentRoutes = require("./routes/contents"),
    indexRoutes= require("./routes/index");

mongoose.connect("mongodb://localhost/cinephile");

app.use(indexRoutes);
app.use(contentRoutes);
app.use(commentRoutes);



var middleware = require("./middleware/index.js");






//hardcoded data
// content.create({
//   title:"hello world",
//   body:"hiii"  
// });


app.listen(process.env.PORT||3000,process.env.IP, function(){
    console.log("cinephile server has started");
})

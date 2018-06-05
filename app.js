var express = require("express"),
    mongoose= require("mongoose"),
    bodyParser= require("body-parser");
    methodOverride= require("method-override");

var app = express();


mongoose.connect("mongodb://localhost/cinephile");


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));  

var contentSchema = new mongoose.Schema({
    title:String,
    body:String,
    created:{type:Date, default:Date.now}
})

var content = mongoose.model("Content",contentSchema);

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
app.get("/new", function (req, res) {
    res.render("new");
});


//create route
app.post("/", function(req,res){
 content.create(req.body.content, function(err,newcontent){
     if(err){
         console.log(err);
     }
     else{
         res.redirect("/");
     }
 })
});

//show route
app.get("/post/:id",function(req,res){
   content.findById(req.params.id, function(err,foundPost){
       if(err){
           res.redirect("/")
       }
       else{
           res.render("show",{foundPost:foundPost})
       }
   }) 
})

//delete route
app.delete("/post/:id", function(req,res){
    content.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/post/<%=content._id%>")
        }
        else{
            res.redirect("/");
        }
    })
})

//edit route
app.get("/post/:id/edit", function(req,res){
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
app.put("/post/:id",function(req,res){
    content.findByIdAndUpdate(req.params.id,req.body.content, function(err,){
        if(err){
            res.redirect("post/:id/edit")
        }
        else{
            res.redirect("/post/"+ req.params.id);
        }
    })
})




//auth routes
app.get("/login", function(req,res){
    res.render("login");
})

app.get("/signup", function (req, res) {
    res.render("signup");
})



app.listen(process.env.PORT||3000,process.env.IP, function(){
    console.log("cinephile server has started");
})

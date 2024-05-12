const express = require("express"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  bodyParser = require("body-parser"),
  LocalStrategy = require("passport-local"),
  passportLocalMongoose = require("passport-local-mongoose")
const User = require("./model/User");
const path = require('path');
let app = express();

mongoose.connect("mongodb+srv://utlive006:u9KBQoLYAnRl60kV@cluster0.7bwjjn4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
  secret: "Rusty is a dog",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=====================
// ROUTES
//=====================

// Showing home page
app.get("/", function (req, res) {
  res.render("home");
});

// Showing secret page
app.get("/secret", isLoggedIn, function (req, res) {
  res.render("secret");
});

// Showing register form
app.get("/register", function (req, res) {
  res.render("register");
});

// Handling user signup
app.post("/register", async (req, res) => {
  const checkUser = await User.findOne({ username: req.body.username });
  if (checkUser){
    res.setHeader("Content-Type", "text/html");
    res.write("<script>alert('User already exists')</script>")
    res.end("<a href='./'>Return to home page</a>");
  
  }else{
  const user = await User.create({
  username: req.body.username,
  password: req.body.password
  });
  res.status(200).json(user+"registration successful");
  setTimeout(() => {
    return res.redirect("/");
  }, 2000)
  }
  });

//Showing login form
app.get("/login", function (req, res) {
  res.render("login");
});

//Handling user login
app.post("/login", async function(req, res){
  try {
    // check if the user exists
    const user = await User.findOne({ username: req.body.username });
    if (user) {
    //check if password matches
    const result = req.body.password === user.password;
    if (result) {
      res.render("secret");
    } else {
      // res.status(400).json({ error: "password doesn't match" });
      res.setHeader("Content-Type", "text/html");
      res.write("<script>alert('Password doesn't match')</script>")
      res.end("<a href='./'>Return to home page</a>");
    }
    } else {
    // res.status(400).json({ error: "User doesn't exist" });
      res.setHeader("Content-Type", "text/html");
      res.write("<script>alert('User doesn't exist')</script>")
      res.end("<a href='./'>Return to home page</a>");
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

//Handling user logout 
app.get("/logout", function (req, res) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});



function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}

let port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});

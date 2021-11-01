//jshint esversion:6
require('dotenv').config()
const mongoose = require('mongoose')
var findOrCreate = require('mongoose-findorcreate')
mongoose.connect('mongodb://localhost:27017/secretsDB',
{useNewUrlParser:true,useUnifiedTopology:true});

const express = require("express");
const ejs = require("ejs");

const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;




const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
      secret:"My fat and juicy secret",
      resave:false,
      saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

const userSchema = new mongoose.Schema ({
      email:String,
      password:String,
      googleId:String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User = new mongoose.model('User',userSchema)

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: 'http://localhost:808/auth/google/secrets',
    userProfileURL:'https://www.googleapis.com/oauth2/v3/userinfo'
  },
  function(accessToken, refreshToken, profile, cb) {
      //   console.log(profile)
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get('/',(req,res)=>{
      res.render('home')
})
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
  );
  app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect 2 secrets.
    res.redirect('/secrets');
  });

app.get('/login',(req,res)=>{
      res.render('login')
})
app.get('/register',(req,res)=>{
      res.render('register')

})
app.get('/secrets',(req,res)=>{
      if(req.isAuthenticated()){
            res.render('secrets')
      }else{
            res.redirect('/login')
      }
})
app.post('/register',(req,res)=>{
      User.register({username:req.body.username},req.body.password,(err,user)=>{
            if(err){
                  console.log(err);
                  res.redirect("/register");
            }else{
                  passport.authenticate('local')(req,res,function(){
                  res.redirect('/secrets')
            })
      }
});
    
})
app.post('/login',(req,res)=>{
      const user = new User({
            username : req.body.username,
            password : req.body.password
      })
      req.login(user,(err)=>{
            if(err){
                  console.log(err);
            }else{
                  passport.authenticate('local')(req,res,()=>{
                        res.redirect('/secrets')
                  });
            }
      })    
})
app.get('/logout',(req,res)=>{
      req.logOut();
      res.redirect('/');
});


app.listen(808,()=>{
      console.log('Server running on port 808');
});
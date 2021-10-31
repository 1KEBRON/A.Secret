//jshint esversion:6
require('dotenv').config()
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/secretsDB',
{useNewUrlParser:true,useUnifiedTopology:true});

const express = require("express");
const ejs = require("ejs");

const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');
const { authenticate } = require('passport');




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
      password:String
});
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User',userSchema)

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get('/',(req,res)=>{
      res.render('home')
})
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
            passport : req.body.password
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
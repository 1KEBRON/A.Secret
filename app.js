//jshint esversion:6
require('dotenv').config()
const mongoose = require('mongoose')

const express = require("express");
const ejs = require("ejs");

const bcrypt = require("bcrypt")
const saltRounds = 10


mongoose.connect('mongodb://localhost:27017/secretsDB',
{useNewUrlParser:true,useUnifiedTopology:true});
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

const userSchema = new mongoose.Schema ({
      email:String,
      password:String
})

const User = new mongoose.model('User',userSchema)

app.get('/',(req,res)=>{
      res.render('home')
})
app.get('/login',(req,res)=>{
      res.render('login')
})
app.get('/register',(req,res)=>{
      res.render('register')

})
app.post('/register',(req,res)=>{
bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    // Store hash in your password DB.
      const submitedusername = req.body.username
      const newUser = new User({
            email:submitedusername,
            password: hash
      })
      newUser.save((err)=>{
            if(!err){
                  console.log('Saved a new user to the secretsDB');
                  res.render('secrets')

            }else{
                  console.log(err);
            }
      })
});
    
})
app.post('/login',(req,res)=>{
      const username = req.body.username
      const password = req.body.password
      User.findOne({email:username},(err,foundUser)=>{
            if(err){
                  console.log(err);
            }else{
                  if(foundUser){
                        // Load hash from your password DB.
                        bcrypt.compare(password,foundUser.password, function(err, result) {
                              if(result === true){
                                    res.render('secrets')
                              }
                              
                              });
                  }
            }
      })
})
app.listen(808,()=>{
      console.log('Server running on port 808');
})
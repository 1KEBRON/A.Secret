//jshint esversion:6
require('dotenv').config()
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption');
const md5 = require('md5')
const express = require("express");
const ejs = require("ejs");

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
const safe_secret = process.env.SECRET_KEY

// userSchema.plugin(encrypt,{secret: safe_secret,encryptedFields: ['password']})
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
      const submitedusername = req.body.username
      const newUser = new User({
            email:submitedusername,
            password:md5(req.body.password)
      })
      newUser.save((err)=>{
            if(!err){
                  console.log('Saved a new user to the secretsDB');
                  res.render('secrets')

            }else{
                  console.log(err);
            }
      })
})
app.post('/login',(req,res)=>{
      const username = req.body.username
      const password = md5(req.body.password)
      User.findOne({email:username},(err,result)=>{
            if(err){
                  console.log(err);
            }else{
                  if(result){
                        if(result.password === password){
                              res.render('secrets')
                        }else{
                              console.log(' not registered ');
                        }
                  }
            }
      })
})
app.listen(808,()=>{
      console.log('Server running on port 808');
})
//jshint esversion:6
const mongoose = require('mongoose')
const express = require("express");
const ejs = require("ejs");

mongoose.connect('mongodb://localhost:27017/secretsDB',
{useNewUrlParser:true,useUnifiedTopology:true});
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

const userSchema = {
      email:String,
      password:String
}
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
      const submitedPaswrd = req.body.password
      const newUser = new User({
            email:submitedusername,
            password:submitedPaswrd
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
      const password = req.body.password
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
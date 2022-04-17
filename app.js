// import modules
// express
const express = require('express')
// ejs templating
const ejs = require('ejs')
// require database - mongoose
const mongoose = require('mongoose')
// require md5 hasing
const md5 = require('md5')

const app = express()
// send static files to express
app.use(express.static('public'))
// ejs rendering
app.set('view engine', 'ejs')
// express middleware parser
app.use(express.urlencoded({extended:true}))

// conenct to DB
mongoose.connect('mongodb://127.0.0.1:27017/UserDB')

// users login schema
const loginSchema = mongoose.Schema({
  email:String,
  password:String
})


// mongoose model
const User = mongoose.model('User',loginSchema)

// homepage
app.get('/',(req,res) => {
  res.render('home')
})

// login
app.get('/login', (req,res) => {
  res.render('login')
})

// register
app.get('/register', (req,res) => {
  res.render('register')
})
// register - save users data to database
app.post('/register', (req,res) => {
  User.create(
    {
    email:req.body.username,
    password:md5(req.body.password)},
  (e,r)=>{
    if(e){
      res.send(e);
    }else { //render secrets page after user has succesfully registered
      console.log(r)
      res.render('secrets')
    }
  })
})


// login - authenticates users account to show secret page
app.post('/login',(req,res) => {
  const loginEmail = req.body.username
  const loginPass = md5(req.body.password)

  // console.log(loginEmail,loginPass)
  
  User.findOne({email:loginEmail},(e,r)=>{
    if(e){ // if error, render back to login page
      console.log(e);
      res.render('login')
    }else{ // no error
      if(loginPass === r.password){ // check if passwords match
        res.render('secrets')
      }else { // doesnt match - render login page
        res.render('login')
      }
    }
  })
})

// port - listen
const port = 3000;
app.listen(port,()=>{
  console.log(`Server; Port ${port}`);
})
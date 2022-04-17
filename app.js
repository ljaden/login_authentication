// import modules
// express
const express = require('express')
// ejs templating
const ejs = require('ejs')
// require database - mongoose
const mongoose = require('mongoose')

// require bcrypt salting
const bcrypt = require('bcrypt')
const saltRounds = 10


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
  const regEmail = req.body.username
  const regPass = req.body.password
  
  // hash password-> input to database
  bcrypt.hash(regPass,saltRounds,(err,hash)=>{
    User.create({email:regEmail,password:hash},(e,result)=>{
      if(!e){
        res.render('secrets')
      }else {
        res.send('Error')
      }
    })
  })
})


// login - authenticates users account to show secret page
app.post('/login',(req,res) => {
  const loginEmail = req.body.username
  const loginPass = req.body.password

  // console.log(loginEmail,loginPass)
  
  User.findOne({email:loginEmail},(e,r)=>{
    if(e){ // if error, render back to login page
      console.log(e);
      res.render('login')
    }else{ // no error
      bcrypt.compare(loginPass,r.password, (error,result)=>{ 
        if(error){ 
          console.log(error);
        }else if(result === true) { // if .compare returns true - give access
          res.render('secrets')
        }else{
          res.send('Incorrect Password')
        }
      })
    }
  })
})

// port - listen
const port = 3000;
app.listen(port,()=>{
  console.log(`Server; Port ${port}`);
})
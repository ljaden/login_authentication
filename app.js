// import modules
// express
const express = require('express')
// ejs templating
const ejs = require('ejs')
// require database - mongoose
const mongoose = require('mongoose')

//==============================================================
// require 
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')
//==============================================================


const app = express()
// send static files to express
app.use(express.static('public'))
// ejs rendering
app.set('view engine', 'ejs')
// express middleware parser
app.use(express.urlencoded({extended:true}))

//==============================================================
app.use(session({
  secret: "Secret Session Key",
  resave:false,
  saveUninitialized:true
}))

// initialize passport
app.use(passport.initialize())
app.use(passport.session())
//==============================================================

// conenct to DB
mongoose.connect('mongodb://127.0.0.1:27017/UserDB')

// users login schema
const loginSchema = mongoose.Schema({
  email:String,
  password:String
})




//==============================================================
loginSchema.plugin(passportLocalMongoose)
//==============================================================




// mongoose model
const User = mongoose.model('User',loginSchema)




//==============================================================
// create strategy with mongoose model User
passport.use(User.createStrategy())

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//==============================================================




// homepage
app.get('/',(req,res) => {
  res.render('home')
})

// secrets
app.get('/secrets', (req,res)=>{
  if (req.isAuthenticated()){
    res.render("secrets")
  } else {
    res.redirect('/login')
  }
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
  const username = req.body.username
  
  
  const UserSchema = new mongoose.Schema({
    active: Boolean
  })
  // 
  User.register({username:username},req.body.password, (error,user)=>{
    if(error){
      console.log(error);
      res.redirect('/register')
    } else {
      passport.authenticate('local')(req,res,function(){
        res.redirect("/secrets")
      })
    }
  })

})
// login - authenticates users account to show secret page
app.post('/login',(req,res) => {
  const loginEmail = req.body.username
  const loginPass = req.body.password

  const user = new User({
    username: loginEmail,
    password: loginPass
  })

  req.logIn(user, (err)=>{
    if(err){
      console.log(err);
    } else {
      passport.authenticate('local')(req,res, () =>{
        res.redirect('/secrets')
      })
    }
  })
})

// LOGOUT
app.get('/logout', (req,res) => {
  req.logout()
  res.redirect('/')
})

// port - listen
const port = 3000;
app.listen(port,()=>{
  console.log(`Server; Port ${port}`);
})

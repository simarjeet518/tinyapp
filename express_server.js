const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const cookieParser = require("cookie-parser");
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');
const app = express();
const PORT = 8080;
const { getUserByemail, filteredUrlDatabase ,badCookie ,generateRandomString ,isURL, validateData, validateLoginData,urlVisitsCount,fetchvisits} = require('./helper');
const {users ,urlDatabase} = require('./database');

// middleware
app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extented: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['make it hard', '123409866312387765']
}));
app.set("view engine", "ejs");



app.get("/",(req,res)=>{
  return res.render("login",{user:null,error:""});
});


// Get and post request for register templates
app.get("/register",(req,res) => {
  return res.render("register",{user:null ,err :""});
});


app.post("/register",(req,res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const ifError = validateData(email,password);
  if (ifError) {
    res.status(403);
    return res.render("register",{user:null ,err :ifError});
  }
  const hashedPassword = bcrypt.hashSync(password,10);
  const userObject = { id: id , email: email, password: hashedPassword};
  users[id] = userObject;
  req.session.userid = id;
  return res.redirect("/urls");
});



//logout request
app.post("/logout",(req,res) => {
  req.session = null;
  return  res.redirect("/login");
});

//get and post request for login template
app.get("/login",(req,res) => {
  return res.render("login",{user:null,error:""});
});



app.post("/login",(req,res) => {
  const loginEmail = req.body.email;
  const loginpassword = req.body.password;
  const userid = getUserByemail(loginEmail,users);
  const Error = validateLoginData(userid,loginpassword);
  if (Error) {
    res.status(403);
    return  res.render("login",{user:null, error:Error});
  }
  req.session.userid = userid;
  return res.redirect("/urls");
});



// Delete URL
app.delete("/urls/:shortURL",(req,res) => {
  badCookie(req);
  if (req.session === null) {
    res.status(404);
    return res.render("login",{user:null,error:"please login first"});
  }
  const userid = req.session.userid;
  if (userid) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    return res.redirect("/urls");
  }
  return res.status(401).send("permission denied");
});



//Edit URL
app.put("/urls/:shortURL",(req,res) => {
  badCookie(req);
  if (req.session === null) {
    res.status(404);
    return res.render("login",{user:null,error:"please login first"});
  }
  const userid = req.session.userid;

  if (userid) {
    const shortURL = req.params.shortURL;
    const longURL = req.body.longURL;
    const arr = fetchvisits(shortURL);
    const visitCount = arr[0];
    const visitors = arr[1];
    const uniqueVisitors = arr[2];
    if (isURL(longURL)) {
      urlDatabase[shortURL].longURL = longURL;
      return res.redirect("/urls");
    } else {
      const templateVars = { shortURL: shortURL, longURL :longURL ,user: users[userid],msg:"please enter a Valid URL", visitCount: visitCount,visitors : visitors ,unique: uniqueVisitors};
      return res.render("urls_show", templateVars);
    }
  }
  return res.status(401).send("permission denied");
  
});




// display page where new longURL added
app.get("/urls/new", (req,res) => {
  badCookie(req);
  if (req.session === null) {
    res.status(401);
    return res.render("login",{user:null,error:"please login first"});
  }
  const id = req.session.userid;
  if (id !== "" || id !== null) {
    const template = { user: users[id], msg : null};
    return  res.render("urls_new",template);
  }
  res.status(401);
  return  res.redirect("/login");
});



//add new url
app.post("/urls", (req, res) =>{
  badCookie(req);
  if (req.session === null) {
    res.status(401);
    return res.render("login",{user:null,error:"please login first"});
  }
  const userid = req.session.userid;

  if (userid !== undefined || userid !== null) {
    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    if (isURL(longURL)) {
      urlDatabase[shortURL] = {};
      urlDatabase[shortURL].longURL = longURL;
      urlDatabase[shortURL].userID = userid;
      return res.redirect(`/urls/${shortURL}`);
    }
    return res.render('urls_new',{user: users[userid], msg : "please enter valid URL"});
  }
  return res.status(401).send("permission denied");
});




//display home page
app.get("/urls",(req,res) =>{
  badCookie(req);
  if (req.session === null) {
    res.status(401);
    return res.render("login",{user:null,error:"please login first"});
  }
  const userid = req.session.userid;
  const user = users[userid];
  if (userid) {
    const databaseURl = filteredUrlDatabase(urlDatabase,userid);
    const templateVars = {urls : databaseURl ,user : user};
    return res.render("urls_index",templateVars);
  }
  res.status(401);
  return  res.render("urls_index",{urls :null ,user: user});
});



// display longURL from shortURL
app.get("/u/:shortURL", (req, res) => {
  badCookie(req);
  let id = "Random(no-cookie)";  // this id is used to get visitors data,if no userid as no one logged in,no cookie in data then  user name will be random(no-cookie)
  if (req.session) {
    id = req.session.userid;
  }
  const shortURL = req.params.shortURL;
  urlVisitsCount(req,shortURL,id);
  if (Object.keys(urlDatabase).includes(shortURL)) {
    const longURL = urlDatabase[shortURL].longURL;
    return res.redirect(longURL);
  }
  res.status(404);
  return res.render('404');
});



// Read specified ShortURL alomg with its long URL
app.get("/urls/:shortURL",(req,res) => {
  badCookie(req);
  const shortURL = req.params.shortURL;
  if (req.session === null) {
    res.status(401);
    return res.render("login",{user:null,error:"please login first"});
  }
  const userid = req.session.userid;
  const user = users[userid];
  const approval = urlDatabase[shortURL].userID === userid;
  if (approval) {
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL].longURL;
    const user = users[req.session.userid];
    const arr = fetchvisits(shortURL);   // data fetched from helper functions for visitors[count,vistors info , unique visits]
    const visitCount = arr[0];
    const visitors = arr[1];
    const uniqueVisitors = arr[2];
    if (Object.keys(urlDatabase).includes(shortURL)) {
      const templateVars = { shortURL: shortURL, longURL :longURL ,user: user , msg:"", visitCount: visitCount, visitors : visitors ,unique : uniqueVisitors};
      return res.render("urls_show", templateVars);
    }
  }
  return  res.render("urls_index",{urls :null ,user: user});
});



app.listen(PORT ,() => {
  console.log(`App listening on port ${PORT}`);
});



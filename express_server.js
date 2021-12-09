const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const cookieParser = require("cookie-parser");
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;
const { verifyEmail, filteredUrlDatabase ,badCookie ,generateRandomString ,urlDatabase ,users ,is_url} = require('./helper');
// middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extented: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['make it hard', '123409866312387765']
}));
app.set("view engine", "ejs");

// display register template
app.get("/register",(req,res) => {
  res.render("register",{user:null});
});


//post register template data
app.post("/register",(req,res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
 
  if (email === "" || password === "")  {
    res.status(403).send("email and password should not be empty");
    return;
  }
  if (verifyEmail(email) !== "") {
    res.status(403).send("email already exists in data ");
    return;
  }
  const hashedPassword = bcrypt.hashSync(password,10);
  const userObject = { id: id , email: email, password: hashedPassword};
  users[id] = userObject;
  req.session.userid = id;
  res.redirect("/urls");
});

//logout display
app.post("/logout",(req,res) => {
  res.clearCookie('userid');
  req.session.userid = "";
  res.redirect("/login");

});

//display login
app.get("/login",(req,res) => {

  res.render("login",{user:null});
});

//Add login
app.post("/login",(req,res) => {
  const loginEmail = req.body.email;
  const loginpassword = req.body.password;
  const userid = verifyEmail(loginEmail);
 
  if (userid !== "" && bcrypt.compareSync(loginpassword,users[userid]['password'])) {
    req.session.userid = userid;
    res.redirect("/urls");
  } else {
    res.status(403).send("email id and password does not match ");
    return;
  }

});

// Delete URL
app.post("/urls/:shortURL/delete",(req,res) => {
  badCookie(req,res);
  const userid = req.session.userid;
  if (userid) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];

    res.redirect("/urls");
  } else {
    res.status(401).send("permission denied");
  }
});

//Edit URL
app.post("/urls/:shortURL/edit",(req,res) => {
  badCookie(req,res);
  const userid = req.session.userid;
  if (userid) {
    const shortURL = req.params.shortURL;
  
    const longURL = req.body.longURL;
    urlDatabase[shortURL].longURL = longURL;
    res.redirect("/urls");
  } else {
    res.status(401).send("permission denied");
  }
});



// display page where new longURL added
app.get("/urls/new", (req,res) => {
  badCookie(req,res);
  const id = req.session.userid;
  if (id !== "") {
    const template = { user: users[id], msg : null};
    res.render("urls_new",template);
  } else {
    res.status(401);
    res.redirect("/login");
    
    
  }
});

//add new url
app.post("/urls", (req, res) =>{
  badCookie(req,res);
  
  const userid = req.session.userid;
  if (userid !== undefined) {

    const shortURL = generateRandomString();
    const longURL = req.body.longURL;
    if (is_url(longURL)) {
    urlDatabase[shortURL] = {};
    urlDatabase[shortURL].longURL = longURL;
    urlDatabase[shortURL].userID = userid;

    res.redirect(`/urls/${shortURL}`);
    } else {
      res.render('urls_new',{user: users[userid], msg : "please enter valid URL"});
    }
  } else {
    res.status(401).send("permission denied");
    
  }
 
});



//display home page
app.get("/urls",(req,res) =>{
  badCookie(req,res);
  const userid = req.session.userid;
  const user = users[userid];
  if (userid) {
   
    const databaseURl = filteredUrlDatabase(urlDatabase,userid);
    const templateVars = {urls : databaseURl ,user : user};
    res.render("urls_index",templateVars);
  } else {
    res.status(401);
    res.render("urls_index",{urls :null ,user: user});
  }
});


// display longURL from shortURL
app.get("/u/:shortURL", (req, res) => {
  badCookie(req,res);
  const shortURL = req.params.shortURL;
  if (Object.keys(urlDatabase).includes(shortURL)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404);
    res.render('404');
  }
});



// Read specified ShortURL alomg with its long URL
app.get("/urls/:shortURL",(req,res) => {
  badCookie(req,res);
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const user = users[req.session.userid];

  if (Object.keys(urlDatabase).includes(shortURL)) {
    const templateVars = { shortURL: shortURL, longURL :longURL ,user: user};
    res.render("urls_show", templateVars);
  }  else {
    
    res.status(404).render('404');
  }
});



//basic operations examples
app.get("/",(req,res) => {
  res.send("Hello !");
});

app.get("/urls.json",(req,res) => {
  res.json(urlDatabase);
});

app.get("/hello",(req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT ,() => {
  console.log(`App listening on port ${PORT}`)
  ;
  
});



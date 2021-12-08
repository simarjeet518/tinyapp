const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require('morgan');
const app = express();
const PORT = 8080;

// middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extented: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

//create 6 characters alphaNumaric code for shortURL
const generateRandomString = function() {
  return  Math.random().toString(36).slice(7);
};

const users = {
  '65478' : {
    id: '65478',
    email: 'simarjeet518@gmail.com',
    password: 'abc123'
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// this is used in get request to set proper header template of login and register ,when no cookie exists
const temp = {
  user : undefined
};

//helper function to match email
const verifyEmail = (email) => {
  let result = "";
  for (let keys in users) {
    if (email === users[keys]['email']) {
      result = keys;
    }
  }
  return result;
  
};


// display register template
app.get("/register",(req,res) => {
  res.render("register",temp);
});


//post register template data
app.post("/register",(req,res) => {
  console.log("register");
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
 
  if (email === "" || password === "")  {
    res.status(403).send("email and password should not be empty");
    return ;
  }
  if (verifyEmail(email) !== "") {
    res.status(403).send("email already exists in data ");
    return ;
  }
  const userObject = { id: id , email: email, password: password};
  users[id] = userObject;
  
  res.redirect("/login");
});

//logout display
app.post("/logout",(req,res) => {
  res.clearCookie('userid');
  res.redirect("/urls");

});

//display login
app.get("/login",(req,res) => {

  res.render("login",temp);
});

//Add login
app.post("/login",(req,res) => {
  const loginEmail = req.body.email;
  const loginpassword = req.body.password;
  const userid = verifyEmail(loginEmail);

  if (userid !== "" && loginpassword === users[userid]['password']) {
    res.cookie('userid',userid);
    res.redirect("/urls");
  } else {
    res.status(403).send("email id and password does not match ");
    return;
  }

  

});

// Delete URL
app.post("/urls/:shortURL/delete",(req,res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];

  res.redirect("/urls");
});

//Edit URL
app.post("/urls/:shortURL/edit",(req,res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  
  urlDatabase[shortURL] = longURL;

  res.redirect("/urls");
});



// display page where new longURL added
app.get("/urls/new", (req,res) => {
  const id = req.cookies["userid"];
  const template = { user: users[id]};
  res.render("urls_new",template);
});

//add new url
app.post("/urls", (req, res) =>{
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  
  res.redirect(`/urls/${shortURL}`);
 
});



//display home page
app.get("/urls",(req,res) =>{
  const id = req.cookies["userid"];
  console.log(id);
  const user = users[id];
  console.log("here" + user);
  const templateVars = {urls : urlDatabase,user: user};
  res.render("urls_index",templateVars);
});


// display longURL from shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (Object.keys(urlDatabase).includes(shortURL)) {
    const longURL = urlDatabase[shortURL];
    res.redirect(longURL);
  } else {
    res.render('404');
  }
});



// Read specified ShortURL alomg with its long URL
app.get("/urls/:shortURL",(req,res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const user = users[req.cookies["userid"]];

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
  console.log(`App listening on port ${PORT}`);
});
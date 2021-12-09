const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;

// middleware
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extented: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

//create 6 characters alphaNumaric code for shortURL
const generateRandomString = function() {
  return  Math.random().toString(36).slice(7);
};

const users = {
  '05fro9': {
    id: '05fro9',
    email: 'simarjeet518@gmail.com',
    password: '$2a$10$lj7yPtDA2xIZPrZOW.98W.JBh3w7Lk6pejxtjj8pW2JjZKxRFReTa'
  },
  m4e2dd: {
    id: 'm4e2dd',
    email: 'ssd@gmail.com',
    password: '$2a$10$hE3yydTnjzFQopcBlVcLAOKQw1B4zWQwsWoNKt79Vzef0wFBPk.9m'
  }
  
  
};

const urlDatabase = {
  y63znj: { longURL: 'http://www.w3schools.com', userID: '05fro9' },
  zif49g: {
    longURL: 'https://github.com/simarjeet518/tinyapp',
    userID: '05fro9'
  },
  i9250c: { longURL: 'https://www.google.com/', userID: 'm4e2dd' },
  kxo387: { longURL: 'http://www.w3schools.com', userID: 'm4e2dd' }
};

//helper function to remove cookies not in my database
const badCookie = (req,res) => {
  const userIds = Object.keys(users);
  const cookiee = req.session.userid;
  if (!userIds.includes(cookiee)) {
    req.session.userid = "";
  }
};

// helper function to get url under logged userid
const filteredUrlDatabase = (urlDatabase,userid) => {
  let filteredObject = {};
  for (let shorturl in urlDatabase) {
    if (urlDatabase[shorturl].userID === userid) {
      filteredObject[shorturl] = urlDatabase[shorturl].longURL;
    }
  }
  return filteredObject;
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
    const template = { user: users[id]};
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
  
    urlDatabase[shortURL] = {};
    urlDatabase[shortURL].longURL = longURL;
    urlDatabase[shortURL].userID = userid;

    res.redirect(`/urls/${shortURL}`);
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



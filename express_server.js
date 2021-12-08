const express = require("express");
const bodyParser = require("body-parser");
const CookieParser = require('cookie-parser');
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({extented: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

//create 6 characters alphaNumaric code for shortURL
function generateRandomString() {
 return  Math.random().toString(36).slice(7);
}

const urlDatabase ={
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//logout display
app.post("/logout",(req,res) => {
  res.clearCookie('username');
  res.redirect("/urls");

});

//Add login
app.post("/login",(req,res) => {
  const username = req.body.username;
 
  res.cookie('username',username);
  console.log(req.cookies['username']);
  res.redirect("/urls");

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
  const template ={ username: req.cookies["username"]};
  res.render("urls_new",template);
});

//add new url
app.post("/urls", (req, res) =>{
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL ;
  
   res.redirect(`/urls/${shortURL}`);
 
});

//display home page
app.get("/urls",(req,res) =>{
  const username = req.cookies["username"];
  console.log(username);
  const templateVars ={urls : urlDatabase,username: username};
  res.render("urls_index",templateVars);
});


// display longURL from shortURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if(Object.keys(urlDatabase).includes(shortURL)){
   const longURL= urlDatabase[shortURL];
   res.redirect(longURL);
  }
  else 
  {
    res.render('404');
  }
});



// Read specified ShortURL alomg with its long URL
app.get("/urls/:shortURL",(req,res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const username = req.cookies["username"];

  if(Object.keys(urlDatabase).includes(shortURL)){
  const templateVars = { shortURL: shortURL, longURL :longURL ,username: username};
  res.render("urls_show", templateVars);
  }  else 
  {
    res.render('404');
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
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({extented: true}));
const PORT = 8080;

app.set("view engine", "ejs");

function generateRandomString() {
 return  Math.random().toString(36).slice(7);
}

const urlDatabase ={
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/",(req,res) => {
  res.send("Hello !");
});

app.get("/urls.json",(req,res) => {
  res.json(urlDatabase);
});

app.get("/hello",(req,res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req,res) => {
  res.render("urls_new");
});

//add new url
app.post("/urls", (req, res) =>{
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL ;
  
   res.redirect(`/urls/${shortURL}`);
 
});


app.get("/urls",(req,res) =>{
  const templateVars ={urls : urlDatabase};
  res.render("urls_index",templateVars);
});



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




app.get("/urls/:shortURL",(req,res) => {
  if(Object.keys(urlDatabase).includes(shortURL)){
  const templateVars = { shortURL: req.params.shortURL, longURL : urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
  }  else 
  {
    res.render('404');
  }
});




app.listen(PORT ,() => {
  console.log(`App listening on port ${PORT}`);
});
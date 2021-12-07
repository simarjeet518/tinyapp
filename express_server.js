const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({extented: true}));
const PORT = 8080;

app.set("view engine", "ejs");

function generateRandomString() {
  Math.random().toString(36).slice(7);
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

app.post("/urls", (req, res) =>{
  console.log(req.body);
  res.send("ok");
})

app.get("/urls",(req,res) =>{
  const templateVars ={urls : urlDatabase};
  res.render("urls_index",templateVars);
});


app.get("/urls/:shortURL",(req,res) => {
  const templateVars = { shortURL: (req.params.shortURL).substring(1), longURL : urlDatabase[(req.params.shortURL).substring(1)]};
  res.render("urls_show", templateVars);
});




app.listen(PORT ,() => {
  console.log(`App listening on port ${PORT}`);
});
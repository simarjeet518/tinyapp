const bcrypt = require('bcryptjs');
const {users,visits, urlDatabase} = require('./database');

//generates 6 digits of string for useris and short url
const generateRandomString = function() {
  return  Math.random().toString(36).slice(7);
};



//helper function to remove cookies not stored in my database, if restarts server then clears userid cookies  in browser if not from databse
const badCookie = (req,res) => {
  const userIds = Object.keys(users);
  const cookiee = req.session.userid;
  if (!userIds.includes(cookiee)) {
    req.session.userid = "";
  }
};

// filter urldatabase return only urls belongs to userid
const filteredUrlDatabase = (urlDatabase,userid) => {
  let filteredObject = {};
  for (let shorturl in urlDatabase) {
    if (urlDatabase[shorturl].userID === userid) {
      filteredObject[shorturl] = urlDatabase[shorturl].longURL;
    }
  }
  return filteredObject;
};

//check if email in database return userid else return empty string
const getUserByemail = (email,users) => {
  let result = "";
  for (let userid in users) {
    if (email === users[userid]['email']) {
      result = userid;
    }
  }
  return result;
  
};
// validate data on registration
const  validateData = (email,password) => {
  let err = "";
  if (email === "" || password === "")  {
    err = "Error : Email and password should not be empty";
    return err;
  }
  if (getUserByemail(email,users) !== "") {
    err = "Error : Email already exists in data ";
    return err;
  }
  return err;
};
//function to check login crendientials
const validateLoginData = (userid,loginpassword) =>{
  let err = "";
  if (userid !== "" && bcrypt.compareSync(loginpassword,users[userid]['password'])) {
    return err;
  } else {
    err = "Error :email id and password does not match";
    return err;
  }
};

const urlVisitsCount =(req)=>{
  let url = req.url;
  const time= (req._startTime).toString();
  let arr = time.split("G");
  let timeStamp = arr[0];
  let userid = req.session.userid; 
   for(let shorturl in urlDatabase){
     if(!Object.keys(visits).includes(shorturl)){
     
      visits[shorturl]={}
      visits[shorturl].visitors ={};
      visits[shorturl].visitors[userid] ={};
      visits[shorturl].count = 0;
      
     }
    }
    for(let shorturl in urlDatabase){
     if(url.includes(shorturl)){
      
     visits[shorturl].count = visits[shorturl].count +1;
     visits[shorturl].visitors[userid]['times'] = timeStamp;
     visits[shorturl].visitors[userid]['count'] = +1;
    
      }
    }
    console.log(visits);
    
    return;

}

// helper function to check valid url or not
const isURL = (str) =>{
  const regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  return str.match(regexp);
};

module.exports = { getUserByemail, filteredUrlDatabase ,badCookie ,generateRandomString ,isURL ,validateData,validateLoginData,urlVisitsCount};
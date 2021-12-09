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

const generateRandomString = function() {
  return  Math.random().toString(36).slice(7);
};


function is_url(str)
{
  regexp =  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
        return str.match(regexp);
};


//helper function to remove cookies not in my database
const badCookie = (req,res) => {
  const userIds = Object.keys(users);
  const cookiee = req.session.userid;
  if (!userIds.includes(cookiee)) {
    req.session.userid = "";
  }
};


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

module.exports = { verifyEmail, filteredUrlDatabase ,badCookie ,generateRandomString ,urlDatabase ,users ,is_url}
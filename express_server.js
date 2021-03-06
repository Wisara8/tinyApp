var express = require("express");
var cookieSession = require('cookie-session');
var app = express();
var PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
app.use(cookieSession({
  name: 'session',
  keys: ['banana'],
  maxAge: 24 * 60 * 60 * 1000 }))
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
 return Math.random().toString(36).substring(2,8);
}

function filterLinks(oldDatabase, ID) {
  filterDatabase = {};
  for (key in oldDatabase) {
    if (ID === oldDatabase[key].userID) {
      filterDatabase[key] = oldDatabase[key]
    }
  }
  return filterDatabase;
}

var urlDatabase = {
    "b2xVn2": {
      url: "http://www.lighthouselabs.ca",
      userID: "userRandomID"
    },
    "9sm5xK": {
      url: "http://www.google.com",
      userID: "user2RandomID"
    }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

//Renders homepage for TinyApp
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  let filtered = filterLinks(urlDatabase, userID);
  let templateVars = { urls: filtered,
                       user: user };
  res.render("urls_index", templateVars);
});

//Renders add new link page
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  let templateVars = {user: user,
                      urls: urlDatabase };
  if (!user) {
    res.redirect("login");
  }
  res.render("urls_new", templateVars);
});

//Redirects to to full url
app.get("/u/:randomShort", (req, res) => {
  let longURL = urlDatabase[req.params.randomShort].url;
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const user = users[userID];
  if (!user ) {
    res.status(403).send("Please Login");
  }
  if (userID != urlDatabase[req.params.id].userID)
    res.status(403).send("Not your link!");
  else {
  let longURL = urlDatabase[req.params.id].url;
  let templateVars = { shortURL: req.params.id,
                       longURL: longURL,
                       urls: urlDatabase,
                       user: user };
  res.render("urls_show", templateVars);
  }
});

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/register", (req, res) => {
  var randomId = generateRandomString();
  const newEmail = req.body.email;
  const newPassword = req.body.password;

  if (newEmail.length === 0 || newPassword.length === 0) {
    res.status("400").send("Email or Password Blank!");
    res.redirect('/');
  }
  for (userID in users) {
    const user = users[userID];
    if (user.email === newEmail && user.password === newPassword) {

      res.status("400").send("Email or Password Taken!");
      res.redirect('/');
      break;
    }
  }
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[randomId]  = {"id": randomId, "email": req.body.email, "password": hashedPassword};
  let loggedInUser = users[randomId];
  req.session.user_id = loggedInUser.id;
  res.redirect('/urls')
});

//Adds a new shortURL with user data to urlDatabase
app.post("/urls", (req, res) => {
  var randomShort = generateRandomString();
  var short = { "shortURL": randomShort };
  let user = req.session.user_id;
  urlDatabase[randomShort] = {'userID': user, 'url': req.body.longURL};
  res.redirect('/urls/'+ randomShort)
});

app.post("/urls/:id/Delete", (req, res) => {
  let user = req.session.user_id;
  if (!user || user != urlDatabase[req.params.id].userID) {
    res.redirect("/login");
  } else {
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
  }
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let loggedIn = null;
  for (key in users) {
    const userEmail = users[key].email;
    if (userEmail === email) {
      let hashedPassword = users[key].password;
      if (bcrypt.compareSync(password, hashedPassword)) {
        loggedIn = users[key].id;
        req.session.user_id = users[key].id;
        break;
      } else {
        res.status("403").send("Password Incorrect!");
      }
    }
  }
  if (!loggedIn) {
    res.status("403").send("Email Not Found!");
  }
  res.redirect('/urls')
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls')
});

app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL;
  urlDatabase[req.params.id].url = longURL;
  res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
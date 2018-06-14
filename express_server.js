var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

function generateRandomString() {
 return Math.random().toString(36).substring(2,8);
}
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const user = users[req.cookies["user_id"]];
  let templateVars = { urls: urlDatabase,
                       user: user };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
  let templateVars = {user: user };
  res.render("urls_new", templateVars);
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
  users[randomId]  = {"id": randomId, "email": req.body.email, "password": req.body.password};
  let loggedInUser = users[randomId];
  res.cookie("user_id", loggedInUser.id);
  res.redirect('/urls')
});

app.post("/urls", (req, res) => {
  var randomShort = generateRandomString();
  var short = { "shortURL": randomShort };
  urlDatabase[randomShort] = req.body.longURL;
  res.redirect('/urls/'+ randomShort)
});

app.post("/urls/:id/Delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let loggedIn = null;

  for (key in users) {
    const userEmail = users[key].email;
    if (userEmail === email) {
      if (users[key].password === password) {
        loggedIn = users[key].id;
        res.cookie("user_id", users[key].id);
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
  res.clearCookie("user_id");
  res.redirect('/urls')
});

app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL;
  urlDatabase[req.params.id] = longURL;
  res.redirect('/urls')
});

app.get("/urls/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  const user = users[req.cookies["user_id"]];
  let templateVars = { shortURL: req.params.id,
                       longURL: longURL,
                       user: user };
  res.render("urls_show", templateVars);

});

app.get("/urls/:randomShort", (req, res) => {
  let longURL = urlDatabase[req.params.randomShort];

  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
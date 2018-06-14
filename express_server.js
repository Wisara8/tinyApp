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
  // let templateVars = { username: req.cookies["username"] }

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       username: req.cookies["username"] };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"] };
  res.render("urls_new", templateVars);
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
  let user = req.body.username;
  res.cookie("username", user);

  res.redirect('/urls')
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls')
});

app.post("/urls/:id", (req, res) => {
  // console.log(req.params.id);
  // console.log(urlDatabase[req.params.id]);
  let longURL = req.body.longURL;
  urlDatabase[req.params.id] = longURL;
  res.redirect('/urls')
});

app.get("/urls/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];

  let templateVars = { shortURL: req.params.id,
                       longURL: longURL,
                       username: req.cookies["username"] };
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
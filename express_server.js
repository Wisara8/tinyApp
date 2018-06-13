var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

function generateRandomString() {
 return Math.random().toString(36).substring(2,8);
}
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  var randomShort = generateRandomString();
  var short = { "shortURL": randomShort };
  urlDatabase[randomShort] = req.body.longURL;
  res.redirect('/urls/'+ randomShort)
});

app.post("/urls/:id/Delete", (req, res) => {
  console.log(req.params.id);
  console.log(urlDatabase[req.params.id]);
  delete urlDatabase[req.params.id];
  res.redirect('/urls')
});

app.get("/urls/:randomShort", (req, res) => {
  let longURL = urlDatabase[req.params.randomShort];
  // console.log(urlDatabase);
  // console.log(longURL);
  // console.log(shortURL);
  //let templateVars = { shortURL: req.params.id,
                       //longURL: longURL };
  //res.render("urls_show", templateVars);

  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  let longURL = urlDatabase[req.params.id];
  // console.log("id");
  let templateVars = { shortURL: req.params.id,
                       longURL: longURL };
  res.render("urls_show", templateVars);
  // res.redirect(longURL);
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
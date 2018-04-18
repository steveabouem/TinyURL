var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

var urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let letters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "t",
    "s",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z"
  ];
  let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  let pointer = Math.round(Math.random());
  let uniqueId = "";

  for (i = 0; i < 6; i++) {
    if (pointer === 0) {
      uniqueId += letters[Math.round(Math.random() * letters.length)];
    } else if (pointer === 1) {
      uniqueId += numbers[Math.round(Math.random() * numbers.length)];
    } //if else statments
  } //for loop

  return uniqueId;
} //generateRandomString function

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie("name", username);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("name");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  console.log(req.body);
  res.render("urls_register");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["name"],
    urls: urlDatabase
  };
  let username = req.cookies.name;
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let newShort = generateRandomString();
  urlDatabase[newShort] = req.body.longURL;
  res.redirect(`/urls/${newShort}`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  let templateVars = { username: req.cookies["name"] };

  res.redirect(longURL, templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  res.redirect("/urls");
  delete urlDatabase[req.params.id];
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    username: req.cookies["name"],
    shortURL: req.params.id
  };
  var longURL = templateVars.shortURL;
  templateVars.longURL = urlDatabase[longURL];
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let shortURL = req.body.shortURL;
  let longURL = req.body.update;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

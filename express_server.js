var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
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

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let newShort = generateRandomString();
  urlDatabase[newShort] = req.body.longURL;
  res.redirect(`/urls/${newShort}`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  res.redirect("/urls");
  delete urlDatabase[req.params.id];
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  var longURL = templateVars.shortURL;
  templateVars.longURL = urlDatabase[longURL];
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  console.log("line 102", req.body);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

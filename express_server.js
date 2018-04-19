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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "user3@example.com",
    password: "bacon-avocado"
  }
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
  let templateVars = { user: users[req.cookies.user_id] };
  res.end("Hello!", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let id = generateRandomString();
  for (user in users) {
    if (users[user].email === email || email === "" || password === "") {
      res
        .status(400)
        .send("Either you used an existing email or you didn't type anything.");
      res.redirect("/urls");
    }
  }

  users[id] = {
    id: id,
    email: email,
    password: password
  };

  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.cookies.user_id] };
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  //verify password when emails works
  //what to do when no email?

  let IDtoTest = "";

  for (const userID in users) {
    if (req.body.email === users[userID].email) {
      IDtoTest = userID;
      console.log("email matched.", IDtoTest);
    }
  }
  if (IDtoTest === "") {
    res.status(400).send("No valid email");
    return;
  }
  if (users[IDtoTest].password === req.body.password) {
    console.log("passwords match: ", IDtoTest);
    console.log("______________________________________");
    res.cookie("user_id", IDtoTest);
    res.redirect("/");
    return;
  }

  if (users[IDtoTest].password !== req.body.password) {
    console.log("passwords don't match: ", IDtoTest);
    console.log("______________________________________");
    res.status(400).send("Invalid password.");
    return;
  }

  // if (req.body.email !== users[IDtoTest].email) {
  //   console.log("users", users);
  //   console.log("__________________________");
  //   console.log("no emial");
  //   console.log("__________________________");

  //   res.status(403).send("Invalid email.");
  //   return;
  // }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let newShort = generateRandomString();
  urlDatabase[newShort] = req.body.longURL;
  res.redirect(`/urls/${newShort}`);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  let templateVars = { user: users[req.cookies.user_id] };

  res.redirect(longURL, templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  res.redirect("/urls");
  delete urlDatabase[req.params.id];
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user: users[req.cookies.user_id],
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

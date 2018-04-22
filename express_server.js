var express = require("express");
var app = express();
var cookieParser = require("cookie-parser");
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
let cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2", "key3"],
    maxAge: 2 * 60 * 60 * 1000
  })
);
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

var urlDatabase = {
  "243567": { url: "https://www.theverge.com", userID: "phxhoz" },
  "295857": { url: "https://www.ufc.com", userID: "sgshgz" },
  "498853": { url: "https://readwrite.com/", userID: "sgshgz" },
  "770352": { url: "http://www.theverge.com", userID: "sgshgz" },
  b2xVn2: { url: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { url: "http://www.google.com", userID: "user2RandomID" },
  "092335": { url: "http://www.unsplash.com", userID: "phxhoz" },
  kgfope: { url: "https://readwrite.com/", userID: "phxhoz" },
  lxforq: { url: "https://www.netflix.com", userID: "sgshgz" }
}; //

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
  //Used to assign random IDs
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

  for (let i = 0; i < 3; i++) {
    uniqueId += letters[Math.floor(Math.random() * letters.length)];
  }

  for (let i = 3; i < 6; i++) {
    uniqueId += numbers[Math.floor(Math.random() * numbers.length)];
  }

  return uniqueId;
} //generateRandomString function

function urlsForUser(id) {
  let newDB = {};
  for (const shortURL in urlDatabase) {
    let linkID = urlDatabase[shortURL].userID;
    if (linkID === id) {
      newDB[shortURL] = urlDatabase[shortURL];
      // console.log("newDB", newDB); test
    }
  }
  return newDB;
} //urlsForUser function

app.get("/", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };
  if (req.session.user_id === undefined) {
    res.redirect("/register");
  }
  res.render("urls_new", templateVars);
}); //Shorthand display page

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
}); //test

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render("urls_register", templateVars);
}); //registration page

app.post("/register", (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  let email = req.body.email;
  let id = generateRandomString();
  // console.log("bcrypt", hashedPassword,  "resulting users: ", users);
  for (user in users) {
    if (
      users[user].email === email ||
      email === "" ||
      req.body.password === ""
    ) {
      res
        .status(400)
        .send("Either you used an existing email or you didn't type anything.");
      res.redirect("/urls");
    }
  }

  users[id] = {
    //user is saved in the "users" database
    id: id,
    email: email,
    password: hashedPassword
  };

  req.session.user_id = id;
  res.redirect("/urls");
}); //regstration complete

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  let IDtoTest = "";

  for (const userID in users) {
    //locates and verifies the user tryin to log in
    const hashedPassword = users[userID].password; //accesses the (already encrypted) existing user password
    let verifiedPassword = bcrypt.compareSync(
      users[userID].password,
      hashedPassword
    );
    if (req.body.email === users[userID].email) {
      IDtoTest = userID;
    }
  }
  if (IDtoTest === "") {
    res.status(400).send("No valid email");
    return;
  }
  if (users[IDtoTest].password === req.body.password) {
    req.session.user_id = IDtoTest;
    res.redirect("/");
    return;
  }

  if (users[IDtoTest].hashedPassword !== req.body.password) {
    res.status(400).send("Invalid password.");
    return;
  }
}); //login complete

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let newDB = urlsForUser(req.session.user_id);
  let templateVars = {
    user: users[req.session.user_id],
    urls: newDB
  };
  // console.log("templatevars.urls", templateVars); test
  res.render("urls_index", templateVars);
}); //main page

app.post("/urls", (req, res) => {
  let newShort = generateRandomString();
  urlDatabase[newShort] = {
    url: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${newShort}`);
}); //shorthand creation

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  let templateVars = { user: users[req.session.user_id] };

  res.redirect(longURL, templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  let linkID = urlDatabase[req.params.id].userID;
  let idVerified = req.session.user_id;
  res.redirect("/urls");

  for (links in urlDatabase) {
    if (linkID !== idVerified) {
      return;
    }
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
}); //shorthand deletion from main page

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].url
  };
  let shortURL = req.params.id;
  let longURL = urlDatabase[req.params.id].url;
  res.render("urls_show", templateVars);
}); //display full shorthand info

app.post("/urls/:id", (req, res) => {
  for (linkObjects in urlDatabase) {
    if (linkObjects === req.body.shortURL) {
      urlDatabase[linkObjects].url = req.body.update;
      // console.log(
      //   "linkobjects and reqbodyshort match:  ",
      //   linkObjects,
      //   "\n reqbodyshort: ",
      //   req.body.shortURL
      // ); test
    }
    // console.log("linkobjects; ", linkObjects); test
  }

  // console.log("req.body", req.body.update, "\n urlsDB: ", urlDatabase);test

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

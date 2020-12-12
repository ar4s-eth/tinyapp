/*
Initial
  Setup
    Modules && Dependencies
*/
//------------------------------\\

const express = require('express');
const crypto = require('crypto'); // Random string generation module
const bodyParser = require('body-parser'); // middleware: changes request body into a string
const cookieParser = require('cookie-parser'); // middleware: helps to read values from cookies

const app = express();
const PORT = 8080;

app.set("view engine", "ejs"); // Setting ejs to be the view engine
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

//--------------------------------------------------\\


// Database Objects
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "aJ48lW": {
    userID: "aJ48lW",
    email: "user@example.com",
    password: "something"
  },
  "randomUserID2": {
    userID: "randomUserID2",
    email: "user2@example.com",
    password: "something2"
  }
};

// ---- Helper Functions ---- \\

// Function returns a random string
// of 6 characters a-Z, 0-9
const generateRandomString = () => {
  return crypto.randomBytes(3).toString('hex');
};

// Filter DB entries by User ID
const filterURLs = (database, user) => {
  const filteredDB = {};
  for (let url in database) {
    if (database[url].userID === user) {
      filteredDB[url] = database[url];
    }
  }
  return filteredDB;
};


//// GET Route Handlers ----------------------\\\\

//// Handler prints urlDatabase as a JSON object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//// Handler prints the user Database
app.get("/users.json", (req, res) => {
  res.json(users);
});

//// Routing/Handling for the index
app.get("/urls", (req, res) => {
  // Get the user id from the cookie
  const userID = req.cookies.user_id;

  // Assing user from user DB
  const user = users[userID];

  // Redirect users that aren't logged in
  if (!userID) {
    return res.redirect("/login");
  }

  // Filter the urlDatabase by the userID
  let userURLs = filterURLs(urlDatabase, userID);

  // Consolidate data for template
  const templateVars = { user , urls: userURLs };

  res.render("urls_index", templateVars);
});

//// Routing/Handling for creating shortURLs
app.get("/urls/new", (req, res) => {
  // Get the user id from the cookie
  const userID = req.cookies.user_id;

  // If no userID, redirect to login
  if (!userID) {
    return res.redirect("/login");
  }

  // Assing user from user DB
  const user = users[userID];

  // Filter the urlDatabase by the userID
  let userURLs = filterURLs(urlDatabase, userID);

  // Consolidate data for template
  const templateVars = { user , urls: userURLs };

  res.render("urls_new", templateVars);
});

//// Routing/Handling for shortURLs
app.get("/urls/:shortURL", (req, res) => {
  // Get the user id from the cookie
  const userID = req.cookies.user_id;

  // Assing user from user DB
  const user = users[userID];

  // Consolidate data for template
  const templateVars = {
    user,
    urls: urlDatabase,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };

  res.render("url_show", templateVars);
});

//// Routing for shortURL links
app.get("/u/:shortURL", (req, res) => {
  // Fetch shortURL
  const shortURL = req.params.shortURL;

  // Add shortURL: longURL to urlDatabase
  const longURL = urlDatabase[shortURL].longURL;

  res.redirect(longURL);
});

//// Routing/Handling for user Registration
app.get("/register", (req, res) => {
  // Get the user id from the cookie
  const userID = req.cookies.user_id;

  // Assing user from user DB
  const user = users[userID];
  
  // Consolidate data for template
  const templateVars = { user };

  res.render("url_registration", templateVars);
});

//// Routing/Handling for user login
app.get("/login", (req, res) => {
  // Get the user id from the cookie
  const userID = req.cookies.user_id;

  // Assing user from user DB
  const user = users[userID];
  
  // Consolidate data for template
  const templateVars = { user };

  res.render("login", templateVars);
});


// POST Route Handlers -----------------------------\\

// shortURL creation/longURL association
app.post("/urls", (req, res) => {
  // Generate a random 6 char string
  let shortURL = generateRandomString();

  // Get the user id from the cookie
  const userID = req.cookies.user_id;
  
  // Assing user from user DB
  let longURL = req.body.longURL;

  // Add shortURL && {longURL, userID} to the database
  urlDatabase[shortURL] = {
    longURL,
    userID
  };

  res.redirect(`urls/${shortURL}`);
});

// Username submission && initial cookie handling
app.post("/login", (req, res) => {

  // Grab credentials from form
  let loginEmail = req.body.email;
  let loginPass = req.body.password;

  // Check to make sure that both Email/Password were provided
  if (loginEmail === "" || loginPass === "") {
    return res.status(403).send('Email/Pass are empty');
  }

  // Check to see if the user already exists
  if (loginEmail && loginPass) {
    for (let user in users) {
      if (loginEmail === users[user]['email'] && loginPass === users[user]['password']) {
        return res.cookie('user_id', user).redirect("/urls");
      }
      if (loginEmail === users[user]['email'] && loginPass !== users[user]['password']) {
        return res.sendStatus(403);
      }
    }
    return res.sendStatus(403);
  }
});

// Clearing Cookies
app.post("/logout", (req, res) => {

  res.clearCookie('user_id');

  res.redirect("urls/");
});

// Registration
app.post("/register", (req, res) => {
// Add a new user to the global users object

  // Registration Logic
  // Check Email/Password were provided
  if (req.body.email === "" || req.body.password === "") {
    return res.sendStatus(400);
  }
  // Check to see if the user already exists
  let regEmail = req.body.email;
  if (req.body.email && req.body.password) {
    for (let user in users) {
      if (regEmail === users[user]['email']) {
        return res.sendStatus(400);
      }
    }
  }

  // Generate the userID,
  // fetch email/password from form
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  // Create a user object
  const user = {
    userID,
    email,
    password
  };

  // Add new user to the database
  users[userID] = user;
  
  // Give them a cookie
  res.cookie('user_id', userID);

  // Send them to the index
  res.redirect("/urls");
});


// shortURL Deletion
app.post("/urls/:shortURL/delete", (req, res) => {
  // Grab shortURL from form
  let shortURL = req.params.shortURL;

  // Import cookie/user_id
  const userID = req.cookies.user_id;
  
  // Only a user can delete their URLs
  if (userID && urlDatabase[shortURL].userID === userID) {
    delete urlDatabase[shortURL];
  }
  res.redirect('/urls');
});

// shortURL Editing
app.post("/urls/:shortURL/edit", (req, res) => {
  // Grab shortURL from params
  let shortURL = req.params.shortURL;

  // Grab longURL from form
  let longURL = req.body.longURL;
  
  // Import cookie/user_id
  const userID = req.cookies.user_id;
  
  // Only a user can edit their URLS
  if (userID && urlDatabase[shortURL].userID === userID) {
    urlDatabase[shortURL] = {
      longURL,
      userID
    };
  }
  res.redirect('/urls');
});



// Server's initial console log to make
// sure it's listening for requests
app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});
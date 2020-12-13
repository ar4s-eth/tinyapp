// Server Initialization
const express = require('express');
const app = express();
const PORT = 8080;

// Helper functions && Databases
const { generateRandomString, filterURLs, getUserByEmail, urlDatabase, users} = require("./helpers");

// Middleware && Modules
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

// Setup
app.set("view engine", "ejs"); // Setting ejs to be the view engine
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['meowmeow'],
  
  //Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


//// GET Route Handlers 

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
  const userID = req.session.user_id;

  
  // Redirect users that aren't logged in
  if (!userID) {
    return res.redirect("/login");
  }
  // Assing user from user DB
  const user = users[userID];

  // Filter the urlDatabase by the userID
  let userURLs = filterURLs(urlDatabase, userID);

  // Consolidate data for template
  const templateVars = { user , urls: userURLs };
 
  res.render("urls_index", templateVars);
});

//// Routing/Handling for creating shortURLs
app.get("/urls/new", (req, res) => {
  // Get the user id from the cookie
  const userID = req.session.user_id;

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
  const userID = req.session.user_id;

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
  const userID = req.session.user_id;

  // If they are logged in, forward to urls
  if (userID) {
    return res.redirect("/urls");
  }

  // Assing user from user DB
  const user = users[userID];
  
  // Consolidate data for template
  const templateVars = { user };

  res.render("url_registration", templateVars);
});

//// Routing/Handling for user login
app.get("/login", (req, res) => {
  // Get the user id from the cookie
  const userID = req.session.user_id;

  // If they are already logged in, redirect to /urls
  if (userID) {
    return res.redirect("/urls");
  }

  // Assing user from user DB
  const user = users[userID];
  
  // Consolidate data for template
  const templateVars = { user };

  res.render("login", templateVars);
});


// POST Route Handlers 

// shortURL creation/longURL association
app.post("/urls", (req, res) => {
  // Generate a random 6 char string
  let shortURL = generateRandomString();

  // Get the user id from the cookie
  const userID = req.session.user_id;
  
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
  let providedEmail = req.body.email;
  let providedPass = req.body.password;

  //1. Check to make sure that both Email/Password were provided
  if (providedEmail === "" || providedPass === "") {
    return res.status(403).send('Email & Password are empty');
  } else {
    //2 the username and password were provided
    // Check to see if the user already exists, if the username and password were provided
    const foundUser = getUserByEmail(providedEmail, users);
    //3. if the user was found
    if(foundUser){
      //then check for the password:
      if (bcrypt.compareSync(providedPass, users[foundUser]['password'])) {
        req.session.user_id = foundUser;
        return res.redirect("/urls");
      } else {
        res.send("Incorrect username or password");
      }
      
    } else {
      res.send("Incorrect username or password");
    }
  }
});


// Clearing Cookies
app.post("/logout", (req, res) => {

  req.session = null;

  res.redirect("urls/");
});

// Registration
app.post("/register", (req, res) => {
// Add a new user to the global users database

  // Registration Logic
  // Check Email/Password were provided
  if (req.body.email === "" || req.body.password === "") {
    return res.sendStatus(400);
  }
  // Check to see if the user already exists
  let providedEmail = req.body.email;
  const foundUser = getUserByEmail(providedEmail, users);

  if (providedEmail && req.body.password) {
    if (foundUser) {
      return res.sendStatus(400);
    }
  }

  // Generate the userID,
  // fetch email/password from form
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  // Password hashing
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Create a user object
  const user = {
    userID,
    email,
    password: hashedPassword
  };

  // Add new user to the database
  users[userID] = user;
  
  // Give them a cookie
  req.session.user_id = userID;

  // Send them to the index
  res.redirect("/urls");
});


// shortURL Deletion
app.post("/urls/:shortURL/delete", (req, res) => {
  // Grab shortURL from form
  let shortURL = req.params.shortURL;

  // Import cookie/user_id
  const userID = req.session.user_id;
  
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
  const userID = req.session.user_id;
  
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
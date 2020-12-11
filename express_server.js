/*
Initial
  Setup
    Modules && Dependencies
*/
//------------------------------\\


//BREAD *****************
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
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

let users = {
  "randomUserID": {
    userID: "randomUserID",
    email: "user@example.com",
    password: "something"
  },
  "randomUserID2": {
    userID: "randomUserID2",
    email: "user2@example.com",
    password: "something2"
  }  
}

// Function returns a random string of 6 characters a-Z, 0-9

const generateRandomString = () => {
  return crypto.randomBytes(3).toString('hex');
};

//// GET Route Handlers ----------------------\\

//// Handler prints urlDatabase as a JSON object
//// (which can be viewed in the browser)
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});

//// Setting route hanlder for path "/urls"
//// && use res.render() to pass the templateVars(urlDatabase)
//// for urls_index to use
app.get("/urls", (req, res) => {
  // get the user's id from the cookie
  const userID = req.cookies.user_id
  // pair && assign 
  const user = users[userID]
  
  const templateVars = { user , urls: urlDatabase };
  // console.log(`get urls`, templateVars);
  res.render("urls_index", templateVars);
});

//// GET route to render the form for URL entry under the path /urls/new
app.get("/urls/new", (req, res) => {
  // console.log(req.cookies)
  
  const userID = req.cookies.user_id
  // pair && assign 
  const user = users[userID]
  
  const templateVars = { user , urls: urlDatabase };
  // console.log(templateVars)
  res.render("urls_new", templateVars);
});

//// Adds a new route for our shortURL key in req.params
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.cookies.user_id
  // pair && assign 
  const user = users[userID]

  const templateVars = { user , urls: urlDatabase, shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] }
  
  res.render("url_show", templateVars);
});

//// Route will redirect any request to /u/shortURL
//// to its longURL in TinyApp
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]; // shortURL: longURL in urlDatabase
  res.redirect(longURL);
});

//// Route to redirect all paths that don't exist to urls
// app.get("*", (req, res) => {
  //   res.redirect("/urls/");
  // });
  
  //// GET endpoint for registration
  app.get("/register", (req, res) => {
    // console.log(`register`)

    // cookieID = req.cookies.user_id 
    const userID = req.cookies.user_id
    // pair && assign 
    const user = users[userID]
    
    const templateVars = { user , urls: urlDatabase };
    res.render("url_registration", templateVars);
  });
  
  //// GET endpoint for login
    app.get("/login", (req, res) => {
      
    const userID = req.cookies.user_id
    // pair && assign 
    const user = users[userID]
    
    const templateVars = { user , urls: urlDatabase };
    res.render("login", templateVars);
  });






// POST Route Handlers -----------------------------\\


// shortURL creation and longURL association
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(); //generate 6 char string
  urlDatabase[shortURL] = req.body.longURL; // shortURL: longURL key/value pair
  // redirect to the new shortURL path
  res.redirect(`urls/${shortURL}`);
});

// Username submission && initial cookie handling
app.post("/login", (req, res) => {

  // Check to see if the user already exists
  // DRY this up later
  let loginEmail = req.body.email;
  let loginPass = req.body.password;

  // Check to make sure that both Email/Password were provided
  if (loginEmail === "" || loginPass === "") {
    return res.status(403).send('Email/Pass are empty');
  }

  // Check to see if the user already exists
  if (loginEmail && loginPass) {
    for (let user in users) {
      console.log(`login`, users[user]);
      if (loginEmail === users[user]['email'] && loginPass === users[user]['password']) {
        return res.cookie('user_id', user).redirect("/urls")
      } 
      if (loginEmail === users[user]['email'] && loginPass !== users[user]['password']) {
        return res.sendStatus(403);
      }
    }
    return res.sendStatus(403);
  } 
});

// Clear Cookies
app.post("/logout", (req, res) => {
  console.log(req.body)

  // if (req.body.email === "" || req.body.password === "") {
  //   res.sendStatus(400);
  // }


  //clears the name of the cookie in the browser
  res.clearCookie('user_id');
  res.redirect("urls/");
});

// Registration
app.post("/register", (req, res) => {
// Add a new user to the global users object
  //include random id, email, password

  // Check to make sure that both Email/Password were provided
  if (req.body.email === "" || req.body.password === "") {
    return res.sendStatus(400);
  }
  // Check to see if the user already exists
  let regEmail = req.body.email;
  if (req.body.email && req.body.password) {
    for(let user in users) {
      console.log(`register`, users[user])
      if (regEmail === users[user]['email']) {
        return res.sendStatus(400);
      }
    }
  };

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
  res.cookie('user_id', userID)

  // Send them to the List
  res.redirect("/urls")

});

// *******************************
// Editing/deletion (Broken) 
// Should have an app.post("/urls/:id") to handle
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL; // assign for easy reference
  // let longURL = req.body.longURL; // same as above
  
  // Deletes the entry in urlDatabase for
  // delete actions from the template (urls_index)
  // console.log(urlDatabase)
  delete urlDatabase[shortURL];
  
  //longURL (value) is assigned to shortURL (key)
  // and replaced in the database
  // urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});
app.post("/urls/:shortURL/edit", (req, res) => {
  let shortURL = req.params.shortURL; // assign for easy reference
  console.log(`in shortURL/edit`, shortURL)
  let longURL = req.body.longURL; // same as above
  console.log(`in shortURL/edit`, longURL)
  
  // Deletes the entry in urlDatabase for
  // delete actions from the template (urls_index)
  // console.log(urlDatabase)
  // delete urlDatabase[shortURL];
  
  //longURL (value) is assigned to shortURL (key)
  // and replaced in the database
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');
});



// Server's initial console log to make 
// sure it's listening for requests
app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});
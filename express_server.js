/*
Initial
  Setup
    Modules && Dependencies
*/
//------------------------------\\

const express = require('express');
const app = express();
const PORT = 8080;
const crypto = require('crypto'); // Random string generation module
app.set("view engine", "ejs"); // Setting ejs to be the view engine
const bodyParser = require('body-parser'); // changes request body into a string
//const { url } = require('inspector');
app.use(bodyParser.urlencoded({extended: true}));

//--------------------------------------------------\\


// Deftault Database Object
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};


// Function returns a random string of 6 characters a-Z, 0-9

const generateRandomString = () => {
  return crypto.randomBytes(3).toString('hex');
};

// GET Route Handlers ----------------------\\

// Handler prints urlDatabase as a JSON object
// (which can be viewed in the browser)
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Setting route hanlder for path "/urls"
// && use res.render() to pass the templateVars(urlDatabase)
// for urls_index to use
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// New GET route to render the form for URL entry under the path /urls/new
app.get("/urls/new", (req, res) => {
  // console.log(`app.get/urls/new`, req.params)
  res.render("urls_new");
});


// Adds a new route for our shortURL key in req.params
app.get("/urls/:shortURL", (req, res) => {
  // packaging up an object to send to the url_show template to reference
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("url_show", templateVars);
});

// Route will redirect any request to /u/shortURL
// to its longURL in TinyApp
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL]; // shortURL: longURL in urlDatabase
  res.redirect(longURL);
});

// Route to redirect all paths that don't exist to urls
app.get("*", (req, res) => {
  res.redirect("/urls/");
});

// Post response path to handle the creation
// of the 6 char shortURL (key) and assign it the
// longURL (value).
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(); //generate 6 char string
  urlDatabase[shortURL] = req.body.longURL; // shortURL: longURL key/value pair
  // redirect to the new shortURL path
  res.redirect(`urls/${shortURL}`);
});

// Route to allow for editing/deletion
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL; // assign for easy reference
  let longURL = req.body.longURL; // same as above
  
  // Deletes the entry in urlDatabase for
  // delete actions from the template (urls_index)
  delete urlDatabase[shortURL];
  
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
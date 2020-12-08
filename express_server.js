/* 
Initial
  Setup
    Modules && Dependencies
*/
//------------------------------\\

const express = require('express');
const app = express();
const PORT = 8080;
// Random string generation module
const crypto = require('crypto');
// Setting ejs to be the view engine
app.set("view engine", "ejs");
// Added before routes to convert the 
// request body from a buffer into a string &&
// adds the data to the request object under the key 
// body: { longURL: 'http://www.longurlstrin}
const bodyParser = require('body-parser');
const { url } = require('inspector');
app.use(bodyParser.urlencoded({extended: true}));

//--------------------------------------------------\\


// Database Object
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};



// Function returns a random string of 6 characters a-Z, 0-9 

function generateRandomString() {
  random = crypto.randomBytes(3).toString('hex');
  return random.toString(random);
};

// Route Handlers

// Prints "Root Directory" when visiting root path
app.get("/", (req, res) => {
  res.send("Root Directory");
});

// Handler prints urlDatabase as a JSON object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Prints "Hello world" with HTML @ /hello path
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Setting route hanlder for path "/urls" 
// && use res.render() to pass the URL data to templateVars
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Add new get route to show the form for URL entry in urls_new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Adds a new route to render url_show template with the :shortURL id. 
// Re-assigns the properties of templateVars using the route handler :shortURL,
// shortURL key gets assigned the route paths value that's being pulled from req.params
// longURL key gets assigned the value of shortURL in the urlDatabase object.

// patter matching routes /urls/ shortURL(key): /what the user types into the browser(value)
//req.params.shortURL holds the property
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("url_show", templateVars); //(which template we're sending data to, what data we are sending)
});

// Post response path to handle the request.
// console.log prints to the server console the body of the request.
// res.send will send a message to the client
app.post("/urls", (req, res) => {
  shortURL = generateRandomString()
  // console.log(`reqbody`, req.body) <return value from template
  // req.params comes from the first argument after post/route
  // key will match with form input names(name=)
  // res.send("Ok");
  // Update urlDatabase with key value pairs, when it receives a POST request to /urls
  urlDatabase[shortURL] = req.body.longURL
  // console.log(`calling shortURL`, shortURL)
  // console.log(`from inside app.post`, urlDatabase)
  // All of the work has been done to hand off, redirect the user to the path/shortURL
  // to display the data.
  res.redirect(`urls/${shortURL}`);
});


//
app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});

// Maybe make a new route for fetching the object from the form 
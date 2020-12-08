const express = require('express');
const app = express();
const PORT = 8080;
//random string generation
const crypto = require('crypto');


//added before routes to convert the request body from a buffer into a string.
//adds the data tot he request object under the key body:
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

//setting ejs to be the view engine
app.set("view engine", "ejs");


//function to implement a random string of 6 charaters using the crypto module
function generateRandomString() {
  return crypto.randomBytes(3).toString('hex');
}

//Route handlers

//register a handler on the root path
app.get("/", (req, res) => {
  res.send("Hello");
});

//json handler prints urlDatabase as a JSON object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})
//
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
})

//set route hanlder for path "/urls" 
//and use res.render() to pass the URL data to the template
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
//add new get route to show the form in urls_new
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

//new route to render url_show template with the :shortURL id. 
//re-assign the properties of templateVars using the route handler :shortURL,
//shortURL key gets assigned the route paths value that's being pulled from req.params
//longURL key get's assigned the value of shortURL in the urlDatabase object.
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("url_show", templateVars);
});

//dummy response that matches the post request path to handle the request.
//console.log prints to the server console the body of the request.
//res.send will send a message to the client
app.post("/urls", (req, res) => {
  console.log(req.body);  
  res.send("Ok");       
});


//
app.listen(PORT, () => {
  console.log(`TinyApp server listening on port ${PORT}!`);
});
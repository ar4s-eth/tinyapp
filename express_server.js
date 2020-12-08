const express = require('express');
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xk": "http://www.google.com"
};

//setting ejs to be the view engine
app.set("view engine", "ejs");


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

//new route to render url_show template with the :shortURL id. 
//re-assign the properties of templateVars using the route handler :shortURL,
//shortURL key gets assigned the route path as it's key, and it's value
//longURL key get's assigned the value of shortURL in the urlDatabase object.
  app.get("/urls/:shortURL", (req, res) => {
    const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("url_show", templateVars);
  });


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
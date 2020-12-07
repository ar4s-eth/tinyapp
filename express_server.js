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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
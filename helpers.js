const crypto = require('crypto');


// Database Objects
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "148c66" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "148c66" }
};

const users = {
  '148c66': {
    userID: "148c66",
    email: "ashley.barr@meow.com",
    password: "$2b$10$QnEamVFEEIAiM.k.9Umbn.h3rTAWtur20JtN7TOxKxdVNIlmbwl8a"
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

// Get users by email
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (email === database[user].email) {
      return user;
    }
  }
  return undefined;
}


module.exports = {
  generateRandomString,
  filterURLs,
  getUserByEmail,
  urlDatabase,
  users
};

const { assert } = require("chai");

// Helper Functions && Database Objects
const { getUserByEmail, filterURLs, urlDatabase } = require("../helpers.js");

const testUserDatabase = {
  randomUser: {
    userID: "randomUser",
    email: "randomUser@gmail.com",
    password: "peaches",
  },
  randomUser2: {
    userID: "randomUser2",
    email: "randomUser2@gmail.com",
    password: "pears",
  },
  '148c66': {
    userID: "148c66",
    email: "ashley.barr@meow.com",
    password: "$2b$10$QnEamVFEEIAiM.k.9Umbn.h3rTAWtur20JtN7TOxKxdVNIlmbwl8a"
  }
};

// Tests

describe("filterURLs", () => {
  it("should return urls for specific user ID", () => {
    const userURLs = filterURLs(urlDatabase, '148c66');
    const expectedOutput = {
      b6UTxQ: { longURL: "https://www.tsn.ca", userID: "148c66" },
      i3BoGr: { longURL: "https://www.google.ca", userID: "148c66" }
    };
    assert.deepEqual(userURLs, expectedOutput);
  });
  
  it("should return an empty object if no urls found for a specific user", () => {
    const userURLs = filterURLs("randomUser", urlDatabase);
    const expectedOutput = {};
    
    assert.deepEqual(userURLs, expectedOutput);
  });
});

describe("getUserByEmail",  () => {
  it("should return a user with valid email",  () => {
    const user = getUserByEmail("ashley.barr@meow.com", testUserDatabase);

    const expectedOutput = "148c66"
  
    assert.deepEqual(user, expectedOutput);
  });

  it("should return undefined if an email does not exist in the database", () => {
    const user = getUserByEmail("ash.barr@meow.com", testUserDatabase);
    const expectedOutput = undefined;

    assert.equal(user, expectedOutput);
  });
});
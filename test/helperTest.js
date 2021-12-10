const { assert } = require('chai');

const { getUserByemail } = require('../helper.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const userid = getUserByemail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(userid,expectedUserID);
  });
  it('should not return a user with for email not existing in data', function() {
    const user = getUserByemail("use@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user,"");
  });
});
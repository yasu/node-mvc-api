# node-mvc-api

A simple Node.js module, which provides an object oriented wrapper for the MVC-online API.

## Installation

`npm install node-mvc-api`

## Example

```javascript
var mvcAPI = require('node-mvc-api')

var CLIENT_ID     = 'c46483cedf229acc122c09a4dd946e6e8c8d5d847d623ffe859a0f026224825c'
var CLIENT_SECRET = '7237584f67b090587bd2ebd4c7fce8cedc5c9c3efda568a028e10261d273776a'
var REDIRECT_URL  = 'urn:ietf:wg:oauth:2.0:oob'

var mvc = new mvcAPI(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);

// Generate URL for consent page landing
var url = mvc.generateAuthUrl():
// Access url and accept with your MVC-online account to get your code and hand it below.
var code = '';

// Get the access token for given code.
mvc.getToken(code, function(error, accessToken, refreshToken, results) {
  // Save accessToken
});

// Get your user account info
mvc.verifyCredentials(accessToken, function(error, profile, response) {
  console.log(profile);
});

// Get collection of communities you're following
mvc.communities(accessToken, function(error, data, response, url) {
  console.log(data);
});

// Upload file to MVC-online
var params = {
  file: 'the raw binary content of the file'
};
mvc.upload(params, accessToken, function(error, body, response, url) {
  console.log(body);
})
```

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

var url = mvc.generateAuthUrl():
mvc.getToken(code, function(error, accessToken, refreshToken, results) {
  
});
```

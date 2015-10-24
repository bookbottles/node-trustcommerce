# node-trustcommerce

[![npm version](https://badge.fury.io/js/node-trustcommerce.svg)](https://badge.fury.io/js/node-trustcommerce)
[![Build](https://travis-ci.org/bookbottles/node-trustcommerce.svg)](https://travis-ci.org/bookbottles/node-trustcommerce)
[![codecov.io](http://codecov.io/github/bookbottles/node-trustcommerce/coverage.svg?branch=master)](http://codecov.io/github/bookbottles/node-trustcommerce?branch=master)

Summary
=======
A node.js library for communicating with the [TrustCommerce](http://www.trustcommerce.com/) payment gateway. This library
returns promises.

You can install via npm:

	npm install node-trustcommerce --save


# Examples

In order to use this library, you'll need your account ID and password.

The `send()` function takes two parameters: the action, and an object of parameters to send. The action
and parameters are defined in the [TC Link API developer's guide](https://vault.trustcommerce.com/downloads/TC_Link_API_Developer_Guide.pdf).

On success, the promise will be fulfilled with an object representing the API response.

## Process a new sale

```javascript
var TCLink = require('node-trustcommerce');

var client = new TCLink('YOUR_ACCOUNT_ID', 'YOUR_PASSWORD');

client.send('sale', {
    amount: 1000,
    cc: '4111111111111111',
    exp: '0419',
    cvv: 123
}).then(function(response) {
    console.log('Successfully processed transaction #: ' + response.transid);
}, function(error) {
    console.error('Encountered error: ' + error.status);
});
```
    
## Handling Errors

If the request encountered an error, the promise will be rejected with an object containing an
`err` message, a `statusCode`, and the request `body`.

If the action itself failed on TrustCommerce's end, then the rejection error will be an object
representation of the API's response.

```javascript
client.send('sale', {
    amount: 1000
}).catch(function(error) {
    // error = {
    //   status: 'baddata',
    //   error: 'missingfields',
    //   offenders: ['cc', 'exp']
    // }
});
```

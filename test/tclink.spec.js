'use strict';

var TCLink = require('../src/tclink');
var client = new TCLink(process.env.TCLINK_USER, process.env.TCLINK_PASS);

describe('The TCLink wrapper', function () {
    it('should return a function', function () {
        TCLink.should.be.a('function');
    });

    it('should reject invalid actions', function () {
        return client.send('purchase', {
            amount: 1000
        }).should.eventually.be.rejectedWith('purchase is not a supported action');
    });
});
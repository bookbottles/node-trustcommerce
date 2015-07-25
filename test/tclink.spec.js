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

    it('should throw an error if a custid is invalid', function () {
        expect(function () {
            new TCLink(null, 'password');
        }).to.throw('A valid customer id is required');
    });

    it('should throw an error if a password is not given', function () {
        expect(function () {
            new TCLink('userid');
        }).to.throw('A valid password is required');
    });
});

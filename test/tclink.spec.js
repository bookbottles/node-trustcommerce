'use strict';

var TCLink     = require('../src/tclink'),
    sinon      = require('sinon'),
    proxyquire = require('proxyquire');

describe('The TCLink wrapper', function() {
    var client;

    before(function(done) {
        if (process.env.TCLINK_USER === undefined || process.env.TCLINK_PASS === undefined) {
            return done(new Error('TCLINK_USER and TCLINK_PASS environment variables must be declared.'));
        } else {
            client = new TCLink(process.env.TCLINK_USER, process.env.TCLINK_PASS);
            done();
        }
    });

    it('should return a function', function() {
        TCLink.should.be.a('function');
    });

    it('should throw an error if a custid is invalid', function() {
        expect(function() {
            new TCLink(null, 'password');
        }).to.throw('A valid customer id is required');
    });

    it('should throw an error if a password is not given', function() {
        expect(function() {
            new TCLink('userid');
        }).to.throw('A valid password is required');
    });

    describe('#send', function() {
        it('should reject invalid actions', function() {
            return client.send('purchase', {
                amount: 1000
            }).should.eventually.be.rejectedWith({err: 'purchase is not a supported action'});
        });

        it('should reject when there are missing fields', function(done) {
            this.timeout(5000);

            return client.send('sale', {
                amount: 1000
            }).then(function() {
                throw new Error('Expected rejection');
            }, function(error) {
                error.should.have.property('status').that.equals('baddata');
                error.should.have.property('error').that.equals('missingfields');
                error.should.have.property('offenders').that.has.members(['cc', 'exp']);
            }).done(done);
        });

        it('should reject when if a card is declined', function(done) {
            this.timeout(5000);

            return client.send('sale', {
                amount: 1000,
                cc: '4012345678909',
                exp: '0419'
            }).then(function() {
                throw new Error('Expected rejection');
            }, function(error) {
                error.should.have.property('status').that.equals('decline');
                error.should.have.property('declinetype').that.equals('decline');
                error.should.have.property('transid').and.match(/^\d{3}-\d{10}$/);
            }).done(done);
        });

        it('should reject when with declinetype of call', function(done) {
            this.timeout(5000);

            return client.send('sale', {
                amount: 1000,
                cc: '5555444433332226',
                exp: '0419'
            }).then(function() {
                throw new Error('Expected rejection');
            }, function(error) {
                error.should.have.property('status').that.equals('decline');
                error.should.have.property('declinetype').that.equals('call');
                error.should.have.property('transid').and.match(/^\d{3}-\d{10}$/);
            }).done(done);
        });

        it('should reject when with declinetype of carderror', function(done) {
            this.timeout(5000);

            return client.send('sale', {
                amount: 1000,
                cc: '4444111144441111',
                exp: '0419'
            }).then(function() {
                throw new Error('Expected rejection');
            }, function(error) {
                error.should.have.property('status').that.equals('decline');
                error.should.have.property('declinetype').that.equals('carderror');
                error.should.have.property('transid').and.match(/^\d{3}-\d{10}$/);
            }).done(done);
        });


        it('should reject extra parameters', function(done) {
            this.timeout(5000);

            return client.send('sale', {
                amount: 1000,
                cc: '4444111144441111',
                date: 'today'
            }).then(function() {
                throw new Error('Expected rejection');
            }, function(error) {
                error.should.have.property('status').that.equals('baddata');
                error.should.have.property('error').that.equals('extrafields');
                error.should.have.property('offenders').that.has.members(['date']);
            }).done(done);
        });

        it('should resolve with valid data', function(done) {
            this.timeout(5000);

            return client.send('sale', {
                amount: 1000,
                cc: '4111111111111111',
                exp: '0419',
                cvv: 123
            }).then(function(response) {
                response.should.have.property('status').that.equals('approved');
                response.should.have.property('transid').and.match(/^\d{3}-\d{10}$/);
            }).done(done);
        });

        describe('if request returns an error', function() {
            var StubbedTC;

            before(function() {
                StubbedTC = proxyquire('../src/tclink', {
                    request: {
                        post: sinon.stub().yields(new Error('Unable to make request'), {
                            statusCode: 500
                        }, null)
                    }
                });

                delete process.env.TCLINK_DEMO;
            });

            it('should return the error gracefully', function(done) {
                var stubbedClient = new StubbedTC(process.env.TCLINK_USER, process.env.TCLINK_PASS);

                stubbedClient.send('sale', {
                    amount: 1000
                }).then(function() {
                    throw new Error('Expected rejection');
                }, function(error) {
                    error.should.deep.equal({
                        err: new Error('Unable to make request'),
                        status: 500,
                        body: undefined
                    });
                }).done(done);
            });

            after(function() {
                process.env.TCLINK_DEMO = 1;
            });
        });
    });

    it('should have the correct host set', function() {
        client.should.have.property('host').that.equals('https://vault.trustcommerce.com/trans/');
    });
});

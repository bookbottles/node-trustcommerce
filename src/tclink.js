'use strict';

var request = require('request'),
    Q       = require('q'),
    _       = require('lodash');

var availableActions = [
    'sale',
    'preauth',
    'postauth',
    'verify',
    'credit',
    'credit2',
    'void',
    'reversal',
    'chargeback'
];


/**
 * @param {string} custid
 * @param {string} password
 * @constructor
 */
var TCLink = function (custid, password) {

    if (!_.isString(custid) || _.isEmpty(custid)) {
        throw new Error('A valid customer id is required');
    }

    if (!_.isString(password) || _.isEmpty(password)) {
        throw new Error('A valid password is required');
    }

    this.custid = custid;
    this.password = password;
};

TCLink.prototype.host = 'https://vault.trustcommerce.com/trans/';

TCLink.prototype._makeRequest = function (action, params) {
    var tclink = this;

    return Q.Promise(function (resolve, reject) {

        request.post({
            url: tclink.host,
            form: _.extend({
                custid: this.custid,
                password: this.password,
                action: action,
                demo: process.env.TCLINK_DEMO ? 'y' : 'n'
            }, params)
        }, function (err, httpResponse, body) {
            if (!err && httpResponse.statusCode === 200) {
                var responseData = _.reduce(body.split('\n'), function (response, entry) {
                    var data = entry.split('=');
                    if (data.length === 2) {
                        response[data[0]] = data[1];
                    }

                    return response;
                }, {});

                if (_.has(responseData, 'status') && responseData.status === 'approved') {
                    resolve(responseData);
                } else {
                    reject(responseData);
                }

            } else {
                reject({
                    err: err,
                    status: httpResponse.statusCode,
                    body: httpResponse.body
                });
            }
        });
    });
};

/**
 * Make an API request to TrustCommerce
 * @param {string} action
 * @param {object} params
 * @param {function} [callback]
 * @returns {Q.Promise}
 */
TCLink.prototype.send = function (action, params, callback) {
    var tclink = this;

    return Q.Promise(function (resolve, reject) {
        if (!_.includes(availableActions, action)) {
            return reject(action + ' is not a supported action.');
        }

        var requestPromise = tclink._makeRequest(action, params);

        if (_.isFunction(callback)) {
            requestPromise.then(function (response) {
                callback(null, response);
            }, function (err) {
                callback(err, null);
            });
        }

        return requestPromise;
    });
};

module.exports = TCLink;

'use strict';

let PremiumizeMe = require('../helper/premiumizeme');
var configuration = require('../helper/premiumizeme.json');

var premiumize = new PremiumizeMe(configuration);

exports.get_account_information = function(req, res) {
    premiumize.accountInformation().then(function (json) {
        res.send(json);
    });
};
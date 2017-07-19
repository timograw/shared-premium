'use strict';

let PremiumizeMe = require('../helper/premiumizeme');
let configuration = require('../helper/premiumizeme.json');

let premiumize = new PremiumizeMe(configuration);

var db = require('mongoose').connection;


var sessionManager = require('./sessionManager');



exports.get_account_information = function (req, res) {
    premiumize.accountInformation().then(function (json) {
        res.send(json);
    });
};

exports.login = function (req, res) {
    if (!req.body || !req.body.username || !req.body.password) {
        res.status(400).send("Username and password required");
        return
    }

    sessionManager.login(req.body.username, req.body.password, function (session) {
        if (!session)
            res.sendStatus(403);
        else {
            session.populate('user', function(err, session) {
                res.cookie('sessionid', session.toJSON()).send(session.toJSON());
            });
            //session.user = User
            
        }
    });
};
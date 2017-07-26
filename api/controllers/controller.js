'use strict';

let PremiumizeMe = require('../helper/premiumizeme').PremiumizeMe;
let configuration = require('../helper/premiumizeme.json');

let premiumize = new PremiumizeMe(configuration);

var db = require('mongoose').connection;

var User = require('../models/userModel');
var Torrent = require('../models/torrentModel');

var sessionManager = require('./sessionManager');

var LINQ = require('node-linq').LINQ;


// Authenticates users and only calls callback if authenticated
function authenticate(req, res, callback) {
    var sessionid = req.cookies.sessionid;
    sessionManager.loadSession(sessionid, function(session) {
        if (!session)
            res.sendStatus(403);
        else
            session.populate('user', function(err, session) {
                if (err) throw err;

                callback(req, res, session);
            });
    });
};

function authenticateAsync(req, res) {
    return new Promise(function(resolve, reject) {
        var sessionid = req.cookies.sessionid;
        sessionManager.loadSession(sessionid, function(session) {
            if (!session) {
                res.sendStatus(403);
                reject()
            }
            else
                session.populate('user', function(err, session) {
                    if (err) throw reject(err);

                    resolve(session)
                });
        });
    })

};


function populateSessionAndSendback(session, res) {
    if (!session) {
        res.cookie('sessionid', '').send("");
        return;
    }
    session.populate('user', function(err, session) {
        var result = {
            sessionid: session.uuid,
            user: {
                username: session.user.username,
                is_admin: session.user.is_admin
            }
        }
        res.setHeader('Content-Type', 'application/json');
        res.cookie('sessionid', session.uuid).send(JSON.stringify(result));
    });
}


exports.get_account_information = function (req, res) {
    authenticate(req, res, function(req, res, session) {
        premiumize.accountInformation().then(function (json) {
            res.setHeader('Content-Type', 'application/json');
            res.send(json);
        });
    })
};


// Create a new session (login)
exports.post_session = function (req, res) {
    if (!req.body || !req.body.username || !req.body.password) {
        res.status(403).send({error: "Username and password required"});
        return
    }

    sessionManager.login(req.body.username, req.body.password, function (session) {
        if (!session)
            res.status(403).send({error: "Login failed"});
        else {
            populateSessionAndSendback(session, res);
        }
    });
};

exports.get_session = function(req, res) {
    var sessionid = req.cookies.sessionid;

    sessionManager.loadSession(sessionid, function(session) {
        populateSessionAndSendback(session, res);
    });
};

exports.delete_session = function(req, res) {
    var sessionid = req.cookies.sessionid;

    sessionManager.loadSession(sessionid, function(session) {
        session.remove(function(err) {
            res.clearCookie('sessionid').send('Loggedout');
        });
    });
};

exports.get_users = function(req, res) {
    authenticateAsync(req, res)
    .then(function(session) {
        return User.find({}).lean().exec();
    })
    .then(function(users) {
        
            var test = new LINQ(users).Select(function(user) { return {
                id: user._id,
                username: user.username,
                is_admin: user.is_admin
            }}).ToArray();

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(test));
        
    })

};

exports.get_files = function(req, res) {
    authenticate(req, res, function(req, res, session) {
        premiumize.listDirectory(null, response => {
            var entries = new LINQ(response.content)
                .Where(entry => { return (entry.type != 'folder') })
                .OrderByDescending(function(entry) { return entry.created_at;})
                .Select(entry => { return {
                    id: entry.id,
                    name: entry.name,
                    size: entry.size,
                    hash: entry.hash,
                    type: entry.type
                }}).ToArray();

            for(var entry of entries) {
                var torrent = new Torrent({
                    pid: entry.id,
                    name: entry.name,
                    size: entry.size,
                    hash: entry.hash,
                    type: entry.type
                })
                
            }

            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(entries));
        });
    });
};
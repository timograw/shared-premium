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
    sessionManager.loadSession(sessionid).then(function(session) {
        if (!session)
            res.sendStatus(403);
        else
            session.populate('user', function(err, session) {
                if (err) throw err;

                callback(req, res, session);
            });
    });
};

async function authenticateAsync(req, res, needAdmin) {
    var sessionid = req.cookies.sessionid;

    var session = await sessionManager.loadSession(sessionid)
    if (!session) {
        res.sendStatus(403);
        throw new Error("Authentication failed");
    }
    
    session = await session.populate('user');

    if (needAdmin && !session.user.is_admin) {
        res.sendStatus(403);
        throw new Error("Authentication failed");
    }
    return session;
};


function populateSessionAndSendback(session, res) {
    if (!session) {
        res.clearCookie('sessionid').send('Loggedout');
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
        premiumize.accountInformation().
        then(function (json) {
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

    sessionManager.loadSession(sessionid)
    .then(function(session) {
        populateSessionAndSendback(session, res);
    });
};

exports.delete_session = function(req, res) {
    var sessionid = req.cookies.sessionid;

    sessionManager.loadSession(sessionid)
    .then(function(session) {
        session.remove(function(err) {
            res.clearCookie('sessionid').send('Loggedout');
        });
    });
};

exports.get_users = function(req, res) {
    authenticateAsync(req, res, true)
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
    .catch(function(err){
        res.sendStatus(500);
    });
};

exports.get_files = function(req, res) {
    authenticateAsync(req, res)
    .then(function(session) {
        return Torrent.find({is_shared: true}).lean().exec();
    })
    .then(function(torrents) {
        
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(torrents));
    })

};



exports.get_premiumize_files = function(req, res) {
    authenticate(req, res, function(req, res, session) {
        premiumize.listDirectory(null, response => {
            var entries = new LINQ(response.content)
                .Where(entry => { return (entry.type != 'folder') })
                .OrderByDescending(function(entry) { return entry.created_at;})
                .Select(entry => { return {
                    pid: entry.id,
                    name: entry.name,
                    size: entry.size,
                    hash: entry.hash,
                    type: entry.type
                }}).ToArray();

            var promises = new Array();
            for(var entry of entries) {
                promises.push(Torrent.findOneAndUpdate({"pid": entry.pid}, entry, {upsert: true}).lean().exec());
            }

            Promise.all(promises)
            .then(function(values) {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(values));
            })

        });
    });
};

exports.post_premiumize_file = function(req, res) {
    var pid = req.params.id;
    authenticateAsync(req, res, true)
    .then(function(session) {
        return Torrent.findOneAndUpdate({"pid": pid}, req.body); //{"is_shared": true}
    })
    .then(function() {
        res.sendStatus(200);
    })
    .catch(function(err) {
        res.status(500);
        throw(err);
    });
};
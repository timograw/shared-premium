var User = require('../models/userModel');
var Session = require('../models/sessionModel');

var hasher = require('password-hash-and-salt');
const uuidv4 = require('uuid/v4');

exports.login = function (username, password, callback) {
    // Load user
    User.findOne({ "username": username }).exec(function (err, user) {
        if (err) throw err;

        // Check if user found
        if (!user) {
            console.log("User not found: " + username);
            callback(null);
        }
        else {
            // Verify password
            hasher(password).verifyAgainst(user.password_hash, function (error, verified) {
                if (error) throw error;
                if (!verified) {
                    console.log("User found, but password does not match");
                    callback(null);
                } else {
                    var session = new Session();
                    session.user_id = user.id;
                    session.uuid = uuidv4();
                    session.save(function(err, session) {
                        session.user = user;

                        callback(session);
                    })
                }
            });
        }
    })
};
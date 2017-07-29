var User = require('../../models/userModel');
var Session = require('../../models/sessionModel');

var hasher = require('password-hash-and-salt');
const uuidv4 = require('uuid/v4');

async function verifyHash(password, hash) {
    return new Promise(function (resolve, reject) {
        hasher(password).verifyAgainst(hash, function (error, verified) {
            if (error) {
                reject();
            }
            resolve(verified);
        });
    });
}

exports.login = async function (username, password) {
    // Load user
    var user = await User.findOne({ "username": username }).lean().exec();

    // Check if user found
    if (!user) {
        console.log("User not found: " + username);
        return null;
    }
    else {
        // Verify password
        var verified = await verifyHash(password, user.password_hash);

        if (!verified) {
            console.log("User found, but password does not match");
            return null;
        }

        var session = new Session({
            user: user,
            uuid: uuidv4()
        });

        return await session.save();


        // hasher(password).verifyAgainst(user.password_hash, function (error, verified) {
        //     if (error) throw error;
        //     if (!verified) {
        //         console.log("User found, but password does not match");
        //         callback(null);
        //     } else {
        //         var session = new Session({
        //             user: user,
        //             uuid: uuidv4()
        //         });
        //         session.save(function (err) {
        //             if (err) throw err;
        //             return session;
        //         })
        //     }
        // });
    }
};

exports.loadSession = async function (sessionid) {
    var session = await Session.findOne({ "uuid": sessionid }).exec();

    if (!session) {
        console.log("Session not found: " + sessionid);
        return null;
    }

    return session;
};


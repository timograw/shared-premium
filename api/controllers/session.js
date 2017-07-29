let express = require('express');
let router = express.Router();
let authenticator = require('./utils/authenticator');
let sessionManager = require('./utils/sessionManager');
var LINQ = require('node-linq').LINQ;

const asyncMiddleware = fn =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    };


async function populateSessionAndSendback(session, res) {
    if (!session) {
        res.clearCookie('sessionid').send('Loggedout');
        return;
    }

    // Populate user property
    await session.populate('user').execPopulate();

    res
        .cookie('sessionid', session.uuid)
        .json({
            sessionid: session.uuid,
            user: {
                username: session.user.username,
                is_admin: session.user.is_admin
            }
        });
}

// Post session / Login
router.post('/session', asyncMiddleware(async (req, res, next) => {
    if (!req.body || !req.body.username || !req.body.password) {
        res.status(403).send({error: "Username and password required"});
        return
    }

    var session = await sessionManager.login(req.body.username, req.body.password);
    if (!session)
        res.status(403).send({error: "Login failed"});
    else {
        await populateSessionAndSendback(session, res);
    }
}));

// Get session
router.get('/session', asyncMiddleware(async (req, res, next) => {
    var sessionid = req.cookies.sessionid;

    var session = await sessionManager.loadSession(sessionid);
    
    await populateSessionAndSendback(session, res);
}));

// Delete session / Logout
router.delete('/session', asyncMiddleware(async (req, res, next) => {
    var sessionid = req.cookies.sessionid;

    var session = await sessionManager.loadSession(sessionid);
    
    session.remove(function(err) {
        res.clearCookie('sessionid').send('Loggedout');
    }); 
}));

module.exports = router;

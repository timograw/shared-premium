var sessionManager = require('./sessionManager');

exports.authenticate = async function(req, res, needAdmin) {
    var sessionid = req.cookies.sessionid;

    var session = await sessionManager.loadSession(sessionid)
    if (!session) {
        //res.sendStatus(403);
        throw new Error("Authentication failed");
    }
    
    session = await session.populate('user').execPopulate();

    if (needAdmin && !session.user.is_admin) {
        //res.sendStatus(403);
        throw new Error("Authentication failed");
    }
    return session;
};
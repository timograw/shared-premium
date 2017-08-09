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

var User = require('../models/userModel');

router.get('/users', asyncMiddleware(async (req, res, next) => {
    var session = await authenticator.authenticate(req, res, true);

    // Load users
    var users = await User.find({}).lean().exec();

    // var test = new LINQ(users).Select(function(user) { return {
    //     id: user._id,
    //     username: user.username,
    //     is_admin: user.is_admin
    // }}).ToArray();

    res.json(users);
}));

module.exports = router;

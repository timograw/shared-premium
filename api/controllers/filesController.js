let express = require('express');
let router = express.Router();
let authenticator = require('./utils/authenticator');
let sessionManager = require('./utils/sessionManager');
var LINQ = require('node-linq').LINQ;
var FileNode = require('../models/fileNodeModel');

const asyncMiddleware = fn =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next))
            .catch(next);
    };


router.get('', asyncMiddleware(async (req, res, next) => {
    var session = await authenticator.authenticate(req, res);

    var nodes = await FileNode.find({is_shared: true}).lean().exec();
    
    res.json(nodes);
}));


module.exports = router;
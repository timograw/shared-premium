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

let PremiumizeMe = require('../helper/premiumizeme').PremiumizeMe;
let configuration = require('../helper/premiumizeme.json');

var User = require('../models/userModel');
var FileNode = require('../models/fileNodeModel');

let premiumize = new PremiumizeMe(configuration);

let premiumizeHelper = require('./utils/premiumizeHelper');

/**
 * Get a node by path
 * @param {string} path 
 */
async function getNode(path) {
    if (path == '/') {
        return {
            "type": "folder",
            "parent": "",
            "path": "/",
            "url": "/"
        }
    }
    else {
        return await FileNode.findOne({"url": path}).lean().exec();
    };
}



router.get('/files*', asyncMiddleware(async (req, res, next) => {
    var session = await authenticator.authenticate(req, res);

    var path = req.path.substring(6);

    var parentNode = await getNode(path);
    
    var children;

    switch(parentNode.type) {
        case 'folder':
            children = await premiumizeHelper.loadAndUpdateFolder(path, parentNode);
            break;

        case 'torrent':
            children = await premiumizeHelper.loadAndUpdateTorrent(path, parentNode);
            break;

        case 'file':
            res.writeHead(302, {
                'Location': parentNode.href
            });
            res.end();
            return;

        default:
            throw new Error("Unknown parent type");
    }


    if (session.user.is_admin) {
        parentNode.children = children;
    }
    else {
        parentNode.children = new LINQ(children)
            .Where(function(c) {return c.type == "dir" || c.type == "file" || c.is_shared;}).ToArray();
    }

    res.json(parentNode);
}));

router.post('/file/:id', asyncMiddleware(async (req, res, next) => {
    var session = await authenticator.authenticate(req, res);

    var pid = req.params.id;
    
    await FileNode.findOneAndUpdate({"pid": pid}, req.body);

    res.sendStatus(200);
}));

module.exports = router;

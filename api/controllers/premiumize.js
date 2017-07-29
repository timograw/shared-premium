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
var Torrent = require('../models/torrentModel');

let premiumize = new PremiumizeMe(configuration);


router.get('/files', asyncMiddleware(async (req, res, next) => {
    var session = authenticator.authenticate(req, res);

    var response = await premiumize.listDirectory(null);

    var entries = new LINQ(response.content)
        .Where(entry => { return (entry.type != 'folder') })
        .OrderByDescending(function (entry) { return entry.created_at; })
        .Select(entry => {
            return {
                pid: entry.id,
                name: entry.name,
                size: entry.size,
                hash: entry.hash,
                type: entry.type
            }
        }).ToArray();
    // var entries = response.content
    //     .filter(entry => entry.type != 'folder')
    //     .sort((left, right)  => left.name.localeCompare(right.name))
    //     .map(entry =>  {
    //                         pid: entry.id,
    //                         name: entry.name,
    //                         size: entry.size,
    //                         hash: entry.hash,
    //                         type: entry.type
    //                     });

    var promises = new Array();
    for (var entry of entries) {
        promises.push(Torrent.findOneAndUpdate({ "pid": entry.pid }, entry, { upsert: true }).lean().exec());
    }

    var values = await Promise.all(promises);
    res.json(values);
}));

router.post('/file/:id', asyncMiddleware(async (req, res, next) => {
    var session = await authenticator.authenticate(req, res);

    var pid = req.params.id;
    
    await Torrent.findOneAndUpdate({"pid": pid}, req.body); //{"is_shared": true}

    res.sendStatus(200);
}));

module.exports = router;

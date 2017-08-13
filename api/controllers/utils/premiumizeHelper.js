
let PremiumizeMe = require('../../helper/premiumizeme').PremiumizeMe;
let configuration = require('../../helper/premiumizeme.json');

var LINQ = require('node-linq').LINQ;

var FileNode = require('../../models/fileNodeModel');

let premiumize = new PremiumizeMe(configuration);


function escapePath(path) {
    return path
        .replace(new RegExp(" ", "g"), '+')
        .replace(new RegExp("ä", "g"),'ae')
        .replace(new RegExp("ö", "g"),'oe')
        .replace(new RegExp("ü", "g"),'ue')
        .replace(new RegExp("\\[", "g"), '_')
        .replace(new RegExp("\\]", "g"), '_');
}


/**
  * Load a folder from Premiumize and update in database.
  * @param {FileNode} parentNode 
  * @return  Array of file nodes
  */
exports.loadAndUpdateFolder = async function(path, parentNode) {
    var pid = (parentNode) ? parentNode.pid : null;
    var response = await premiumize.listDirectory(pid);

    var entries = new LINQ(response.content)
        .OrderByDescending(function (entry) { return entry.created_at; })
        .Select(entry => {
            return {
                "pid": entry.id,
                "name": entry.name,
                "size": entry.size ? entry.size : 0,
                "hash": entry.hash,
                "type": entry.type,
                "parent": path,
                "path": path + entry.name + "/",
                "url": escapePath(path) + escapePath(entry.name) + "/"
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
        promises.push(FileNode.findOneAndUpdate({ "pid": entry.pid }, entry, { upsert: true }).lean().exec());
    }

    return await Promise.all(promises);
}

exports.loadAndUpdateTorrent = async function(path, parentNode) {
    var response = await premiumize.browseTorrent(parentNode.hash);

    return await processEntries(path, response.content);
}

async function processEntries(path, entries) {
    var arr = new Array();
    for (const entry of Object.values(entries)) {
        switch (entry.type) {
            case "dir":
                var dir = {
                    "type": "dir",
                    "name": entry.name,
                    "size": entry.size ? entry.size : 0,
                    "items": entry.items,
                    "download": entry.zip,
                    "path": path + entry.name + '/',
                    "url": escapePath(path) + escapePath(entry.name) + '/'
                };
                dir = await FileNode.findOneAndUpdate({ "path": dir.path }, dir, { upsert: true }).lean().exec();
                if (entry.children)
                    dir.children = await processEntries(dir.path, entry.children);
                arr.push(dir);
                break;

            case "file":
                var file = {
                    "type": "file",
                    "name": entry.name,
                    "size": entry.size ? entry.size : 0,
                    "path": path + entry.name,
                    "download": entry.url,
                    "url": escapePath(path) + escapePath(entry.name)
                };
                file = await FileNode.findOneAndUpdate({ "path": file.path }, file, { upsert: true }).lean().exec();
                arr.push(file);
                break;

            default:
                throw new Error("Unknown entry type: " + entry.type);
        }
    }
    return arr;
}
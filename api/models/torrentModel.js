var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var TorrentSchema = Schema({
    pid: {
        type: String
    },
    hash: {
        type: String
    },
    name: {
        type: String
    },
    type: {
        type: String
    },
    path: {
        type: String
    }
});

module.exports = mongoose.model('Torrent', TorrentSchema);
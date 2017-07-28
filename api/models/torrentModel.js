var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var TorrentSchema = Schema({
    pid: {
        type: Number
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
    size: {
        type: Number
    },
    path: {
        type: String
    },
    is_shared: {
        type: Boolean
    }
});

module.exports = mongoose.model('Torrent', TorrentSchema);
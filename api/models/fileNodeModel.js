var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var FileNodeSchema = Schema({
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
    parent: {
        type: String
    },
    path: {
        type: String
    },
    is_shared: {
        type: Boolean
    },
    url: {
        type: String
    },
    zip: {
        type: String
    }
});

module.exports = mongoose.model('FileNode', FileNodeSchema);
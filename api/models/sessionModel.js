var mongoose = require('mongoose');

var sessionSchema = mongoose.Schema({
    user_id: {
        type: String
    },
    uuid: {
        type: String
    }
});

module.exports = mongoose.model('Session', sessionSchema);
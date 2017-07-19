var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var sessionSchema = Schema({
    user: {
        type: Schema.Types.ObjectId, 
        ref: "User"
    },
    uuid: {
        type: String
    }
});

module.exports = mongoose.model('Session', sessionSchema);
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password_hash:{
        type: String,
        required: true
    },
    is_admin: {        
        type: Boolean
    },
    create_date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User', userSchema);
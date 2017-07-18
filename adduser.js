var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shared-premium');

var password = require('password-hash-and-salt');

var db = require('mongoose').connection;
db.on('error', console.error.bind(console, 'connection error:'));

var User = require('./api/models/userModel');

var timo = new User({ 
    username: 'admin',
    is_admin: true
 });

password('password').hash(function (error, hash) {
    if (error) throw error;
    timo.password_hash = hash;
    timo.save(function (err) {
        if (err)  throw err;
        console.log('saved');
        process.exit();
    });

    // process.exit();
});


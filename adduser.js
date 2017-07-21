var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/shared-premium');

var password = require('password-hash-and-salt');

var db = require('mongoose').connection;
db.on('error', console.error.bind(console, 'connection error:'));

var User = require('./api/models/userModel');

var user = new User({ 
    username: 'test',
    is_admin: true
 });

console.log(user.username);

password('test').hash(function (error, hash) {
    if (error) throw error;
    user.password_hash = hash;
    user.save(function (err) {
        if (err)  throw err;
        console.log('saved');
        process.exit();
    });

    // process.exit();

});


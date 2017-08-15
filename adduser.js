const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});



var password = require('password-hash-and-salt');




rl.question("Username: ", (username) => {
    rl.question("Password: ", (pass) => {
        var mongoose = require('mongoose');
        mongoose.connect('mongodb://localhost/shared-premium');
        var db = require('mongoose').connection;
        db.on('error', console.error.bind(console, 'connection error:'));

        var User = require('./api/models/userModel');

        var user = new User({ 
            username: username,
            is_admin: false
        });

        password(pass).hash(function (error, hash) {
            if (error) throw error;
            user.password_hash = hash;
            user.save(function (err) {
                if (err)  throw err;
                console.log('saved');
                process.exit();
            });
        });
    })
})




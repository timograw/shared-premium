'use strict';
module.exports = function(app) {

    var controller = require('../controllers/controller');

    app.route('/accountinfo')
        .get(controller.get_account_information);
};
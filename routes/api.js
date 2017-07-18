// module.exports = function(app) {

//     var controller = require('../controllers/controller');

//     app.route('/accountinfo')
//         .get(controller.get_account_information);
// };

var express = require('express');
var router = express.Router();
var controller = require('../api/controllers/controller');

router.get('/', function(req, res, next) {
  res.send('api');
});

/* GET home page. */
router.route('/accountinfo')
        .get(controller.get_account_information);

router.route('/login').all(controller.login);
// .get('/accountinfo', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;

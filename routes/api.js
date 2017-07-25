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

router.route('/session')
  .get(controller.get_session)
  .post(controller.post_session)
  .delete(controller.delete_session);

router.route('/users').get(controller.get_users);

router.route('/files').get(controller.get_files);


module.exports = router;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compression = require('compression');
var mongoose = require('mongoose');
var winston = require('winston'),
    expressWinston = require('express-winston');

var premiumize = require('./api/controllers/premiumize');
var sessionController = require('./api/controllers/session');
var userController = require('./api/controllers/userController');
var filesController = require('./api/controllers/filesController');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/shared-premium', {
  useMongoClient: true
});

var index = require('./routes/index');

var app = express();

app.use(compression());



app.use(expressWinston.logger({
    transports: [
      new winston.transports.Console({
        json: true,
        colorize: true
      })
    ],
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: true // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    //ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
  }));

  // view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var options = {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['htm', 'html'],
  index: 'index.html',
  lastModified: true
  // maxAge: '1d'
  // setHeaders: function (res, path, stat) {
  //   res.set('x-timestamp', Date.now());
  //   res.header('Cache-Control', 'public, max-age=1d');
  // }
};

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, 'client'), options));
//app.use('/', express.static(path.join(__dirname, 'client/build/default'), options));

app.use('/api/premiumize', premiumize);
app.use('/api', sessionController);
app.use('/api', userController);
app.use('/api/files', filesController);

app.get('*', function (req, res) {
  if (req.url.endsWith(".html")) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
  else {
    res.sendFile(path.join(__dirname, 'client/index.html'), options);
  }
});



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');

  console.log('Error: ' + err.message);
  console.log(err.stack);
});

module.exports = app;
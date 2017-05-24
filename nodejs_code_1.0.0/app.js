var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

require("./routes/js/common.js");

var index = require('./routes/index');
var usermanager = require('./routes/usermanager');
var dynamic = require('./routes/dynamic');
var relation = require('./routes/relation');
var collect = require('./routes/collect');
var report = require('./routes/report');
var notice = require('./routes/notice');
var fdhmgr = require('./routes/fdhmgr');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// simple logger for this router's requests
app.use(function(req, res, next) {
	console.log('begin %s',req.path);
	next();
});

app.use('/', index);
app.use('/usermanager', usermanager);
app.use('/dynamic', dynamic);
app.use('/relation', relation);
app.use('/collect', collect);
app.use('/report', report);
app.use('/notice', notice);
app.use('/fdhmgr', fdhmgr);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  console.log(err);
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

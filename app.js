var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var asyncPolling = require('async-polling');
var poll = require('./modules/poll.js');
var findKeywords = require('./modules/findKeywords.js');
var async = require('async');
var mecab = require('mecab-ya');

var format = require('date-format');

var mongoose = require('mongoose');
var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
  console.log("Connected to mongod server");
});
mongoose.connect('mongodb://52.78.23.87/greenkiwidb');

var KiwiSchema = require('./models/Kiwi.js');
var Kiwi = mongoose.model('Kiwi', KiwiSchema);
var TreeSchema = require('./models/Tree.js');
var Tree = mongoose.model('Tree', TreeSchema);

// view engine setup
app.set('views', path.join(__dirname, 'public/andia-agency-v2'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

var words = new Array();
words[0] = new Array();
words[1] = new Array();

var polling = asyncPolling(function (end){
  async.series([
     function(callback){
        words = [];
        poll(words, callback);
     },
     function(callback){
	Tree.findOne({date: 'now'}, function(err,tree){
	    tree.topics = [];
	    tree.save(function(err){callback(null,1)});
	});
     }
  ], function(err, result){
    for(var i = 0; i < words.length; i++){
      findKeywords(words[i]);
    }
    end(null, '#' + result + ' wait a second...');
  });
}, 30000);

polling.run();

//findKeywords();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var routes = require('./routes/index');
var users = require('./routes/users');
var normalizePort = require('./utils').normalizePort;
var redis = require('redis');
var app = express();
var redisClient = redis.createClient();

redisClient.once('ready', function(){
    redisClient.get('chat_users', function(err, reply){
       if(reply){
           chatters = JSON.parse(reply);
       }
    });

    redisClient.get('chat_app_messages', function(err, reply){
       chat_messages = JSON.parse(reply);
    });
});
app.set('port', normalizePort(process.env.PORT || '3010'));
app.set('server', http.createServer(app));

var io = require('socket.io')(app.get('server'));
var chatters = [];
var chat_messages = [];
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

app.use('/', routes);
app.use('/users', users(app, redisClient, chatters, chat_messages));


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

io.on('connection', function(socket){
    socket.on('message', function(data){
       io.emit('send', data);
    });

    socket.on('update_chatter_count', function(data){
        io.emit('count_chatters', data);
    })
});

module.exports = app;

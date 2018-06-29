var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
var subdomain = require('express-subdomain');
var http = require('http');
var https = require('https');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var ioServer = require('socket.io');
var app = express();

var port = 8082;
var portSSL = 8444;

const options = {
  //key: fs.readFileSync("../certs/mam.iotamixer.io/privkey.pem"),
  //cert: fs.readFileSync("../certs/mam.iotamixer.io/fullchain.pem"),
  requestCert: false,
  rejectUnauthorized: false
};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(options, app);

var io = new ioServer();
io.attach(httpServer);
io.attach(httpsServer);
//console.log("IOOOOO",io);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(subdomain('pastebin', indexRouter));
app.use(subdomain('pastebin', usersRouter));

// Make our server accessible to our router
app.use(function(req,res,next){
  req.io = io;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

httpServer.listen(port);
httpsServer.listen(portSSL);
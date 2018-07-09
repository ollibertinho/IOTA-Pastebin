var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
var subdomain = require('express-subdomain');
var http = require('http');
var https = require('https');
var IOTA = require('iota.lib.js');
var myio = require('./socket');
var monk = require('monk');
var app = express();
var myDb = require('./db');

// ### Configuration BEGIN

// Serverports
var port = 8082;
var portSSL = 8444;

// Node-Configuration
//var iota = new IOTA({ provider: 'http://localhost:14265' })	
var iota = new IOTA({ provider: 'https://field.carriota.com:443' });

// Database-Configuration
var db = monk('localhost:27017/pastebin');

// SSL-Configuration
const options = {
  //key: fs.readFileSync("../certs/tangle.army/privkey.pem"),
  //cert: fs.readFileSync("../certs/tangle.army/fullchain.pem"),
  requestCert: false,
  rejectUnauthorized: false
};

// ### Configuration END

var mongo = new myDb.PasteDB(db);

var httpServer = http.createServer(app);
var httpsServer = https.createServer(options, app);

var pastebinSocket = myio(mongo,iota);
pastebinSocket.attach(httpServer);
pastebinSocket.attach(httpsServer);

var indexRouter = require('./routes/index')(mongo);
var pastebinRouter = require('./routes/pastebin')();

app.use('/', indexRouter);
app.use('/', pastebinRouter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'pb/public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(subdomain('paste', indexRouter));
app.use(subdomain('paste', pastebinRouter));

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

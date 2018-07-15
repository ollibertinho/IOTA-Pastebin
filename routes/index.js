var express = require('express');
var router = express.Router();

var indexRouter = function(mongo) {
    router.get('/', function(req, res, next) {

    mongo.countPastebinsTotal().then((total)=>{
      mongo.countPastebinsToday().then((today)=>{
        res.render('index',  { pasteCnt: total, pasteCntToday: today }); 
      });
    });
  });
  return router;
}

module.exports = indexRouter;
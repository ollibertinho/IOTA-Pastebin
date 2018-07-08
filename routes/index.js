var express = require('express');
var router = express.Router();

var indexRouter = function(mongo) {
  router.get('/', function(req, res, next) {

    mongo.countAddresses().then((cnt)=>
    {
      res.render('index',  { pasteCnt: cnt }); 
    });   
  });
  return router;
}

module.exports = indexRouter;
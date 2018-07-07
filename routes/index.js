var express = require('express');
var router = express.Router();

var indexRouter = function(db) {
  router.get('/', function(req, res, next) {
    db.collection("addresses").count({}, function(error, numOfDocs){
      if(error){
        res.render('index',  { pasteCnt: "unknown" });
      }else {
        db.close();
        res.render('index',  { pasteCnt: numOfDocs }); 
       }     
    });  
  });
  return router;
}

module.exports = indexRouter;
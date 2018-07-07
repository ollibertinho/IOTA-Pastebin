var express = require('express');
var router = express.Router();

var pbRouter = function() {

	router.get('/p_:id', function(req, res, next) {		
		shortId = req.params.id;
		console.log("get short id...", shortId);
		res.render('pastebin');
	});
	
	router.get('/p', function(req, res, next) {
		address = req.query.id;
		console.log("get address...", address);
		res.render('pastebin');
	});
	return router;
}

module.exports = pbRouter;

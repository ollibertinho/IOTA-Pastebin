var express = require('express');
var router = express.Router();

var pbRouter = function() {

	console.log("PBROUTER");

	router.get('/p_:id', function(req, res, next) {		
		console.log("MIT SHORT ID");
		shortId = req.params.id;
		address = null;
		console.log("get short id...", shortId);
		res.render('pastebin');
	});
	
	router.get('/p', function(req, res, next) {
		console.log("MIT ADDRESS");
		address = req.query.id;
		shortId = null;
		console.log("get address...", address);
		res.render('pastebin');
	});
	return router;
}

module.exports = pbRouter;

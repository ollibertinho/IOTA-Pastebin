var express = require('express');
var router = express.Router();

var pbRouter = function() {

	router.get('/p_:id', function(req, res, next) {		
		res.render('pastebin');
	});
	
	router.get('/p', function(req, res, next) {
		res.render('pastebin');
	});
	return router;
}

module.exports = pbRouter;

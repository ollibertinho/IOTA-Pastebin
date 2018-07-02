var express = require('express');
var router = express.Router();
var SimpleMAM = require('simplified-mam-lib');

router.get('/', function(req, res, next) {

	var io = req.io;
	var iota = req.iota;
	io.on('connection', function(socket)
	{
		try 
		{
			var iota = req.iota;
			socket.on('retrieve', retrievePastebin);
			
			function retrievePastebin(pastebinData)
			{		
				console.log(pastebinData.id);
				try 
				{			
					var fetchData = new SimpleMAM.MAMFetchData(iota, pastebinData.id);
					
					SimpleMAM.MAMLib.fetchMessages(fetchData, function(msg) {
						io.to(socket.id).emit('retrieved', msg);
					}).catch(err => {
						console.log('exception:'+err);
						io.to(socket.id).emit('error', err.message);
					});
					
					//MOCK
					//var retVal = { "source":"<html>\r\n<body class=\"test\">Plain text can include <strong>html</strong>\r\n<br/></body></html>", "syntax":"html" };
					//io.to(socket.id).emit('retrieved', retVal);
				} catch(e){
				  console.log('exception:'+e);
				  io.to(socket.id).emit('error', e.message);
				}
			}	
		} catch(e) {
		  console.log('exception:'+e);
		  io.to(socket.id).emit('error', e.message);
		}
	})
	res.render('pastebin');
});

module.exports = router;

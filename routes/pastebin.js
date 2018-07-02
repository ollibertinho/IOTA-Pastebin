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
						console.log('exception:'+err);
						io.to(socket.id).emit('retrieved', msg);
					}).catch(err => {
						console.log('exception:'+err);
						io.to(socket.id).emit('error', err.message);
					});
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

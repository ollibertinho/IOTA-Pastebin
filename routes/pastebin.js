var express = require('express');
var router = express.Router();
var SimpleMAM = require('simplified-mam-lib');

function fetchPastebin(address, io) {
	try 
	{			
		var fetchData = new SimpleMAM.MAMFetchData(iota, address);		
		SimpleMAM.MAMLib.fetchMessages(fetchData, function(msg) {
			var jsonObj = JSON.parse(msg);
			jsonObj.address = address;
			io.to(socket.id).emit('retrieved', jsonObj);
		}).catch(err => {
			console.log('exception:'+err);
			io.to(socket.id).emit('error', err.message);
		});		
	} catch(e){
	  console.log('exception:'+e);
	  io.to(socket.id).emit('error', e.message);
	}	
}

router.get('/pb_:id', function(req, res, next) {
	
	var iota = req.iota;
	var io = req.io;
	var db = req.db;
	var id = req.params.id;
	io.on('connection', function(socket)
	{
		try 
		{			
			console.log("PARAMS",req.params);
			if(id == null) {
				io.to(socket.id).emit('retrieveNotPossible', 'No pastebin-id provided.');
			} else {
				console.log("find long Id of", id);
				db.collection('addresses').findOne({shortid: id}, 'address').then((doc) => {					
					console.log("DOC", doc);										
					if(address != null) {
						fetchPastebin(doc.address, io);
					}
				});
			}
		} catch(e) {
			console.log('exception:'+e);
			io.to(socket.id).emit('error', e.message);		  
		}
	});
	res.render('pastebin');
});


router.get('/pb', function(req, res, next) {

	var io = req.io;
	var iota = req.iota;
	var address = req.query.id;
	var db = req.db;
    
	io.on('connection', function(socket)
	{
		try 
		{
			socket.on('retrieve', retrievePastebin);
			
			function retrievePastebin(pastebinData)
			{		
				if(address == null) {
					io.to(socket.id).emit('retrieveNotPossible', 'No pastebin-id provided.');
					return;				
				}			
				fetchPastebin(address, io);
			}	
		} catch(e) {
		  console.log('exception:'+e);
		  io.to(socket.id).emit('error', e.message);
		}
	})
	res.render('pastebin');
});

module.exports = router;

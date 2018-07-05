var express = require('express');
var router = express.Router();
var SimpleMAM = require('simplified-mam-lib');

function fetchPastebin(address, io, iota, socketId, shortId) {
	try 
	{
		var fetchData = new SimpleMAM.MAMFetchData(iota, address);		
		SimpleMAM.MAMLib.fetchMessages(fetchData, function(msg) {
		    try {
				var jsonObj = JSON.parse(msg);
				jsonObj.shortid = shortId;
				jsonObj.address = address;
				console.log("RETRIEVED", jsonObj);
    			io.to(socketId).emit('retrieved', jsonObj);
		    } catch(e) {
        	  console.log('exception:'+e);
        	  io.to(socketId).emit('retrieveNotPossible', e);
        	}
		}).catch(err => {
			console.log('exception:'+err);
			io.to(socketId).emit('retrieveNotPossible', err.message);
		});		
	} catch(e){
	  console.log('exception:'+e);
	  io.to(socketId).emit('retrieveNotPossible', e);
	}	
}

var pbRouter = function(io, iota, db) {
	var shortId = null;
	var address = null;

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

	io.on('connection', function(socket)
	{
		console.log('client connected:' + socket.id);

		socket.on('retrieve', retrievePastebin);
		function retrievePastebin(pastebinData)
		{
			try 
			{	
				if(shortId == null && address == null) {
					console.log("Retrieve not possible. No pastebin-id provided.");
					io.to(socket.id).emit('retrieveNotPossible', 'No pastebin-id provided.');
				} else {
				
					if(shortId != null) {
						console.log("find long Id of", shortId);
						db.collection('addresses').findOne({shortid: shortId}, 'address').then((doc) => {					
							address = doc.address;	
							if(address != null) {
								console.log("start fetching", address);
								fetchPastebin(address, io, iota, socket.id, shortId);
							}else {
								console.log("find long Id failed...");
								io.to(socket.id).emit('retrieveNotPossible','');
							}    					
						}).catch(err => {
							console.log('exception:'+err);
							io.to(socketId).emit('retrieveNotPossible', err.message);
						});	
					} else {						
						console.log("find short ID Id of", address);
						db.collection('addresses').findOne({address: address}, 'shortid').then((doc) => {					
							shortId = doc.shortid;	
							console.log("start fetching", address);
							fetchPastebin(address, io, iota, socket.id, shortId);
						}).catch(err => {
							console.log('exception:'+err);
							io.to(socketId).emit('retrieveNotPossible', err.message);
						});
					}									
				}
			} catch(e) {
				console.log('exception:'+e);
				io.to(socket.id).emit('retrieveNotPossible', e);		  
			}
		}

		socket.on('disconnect', function(){		
			try {
			  console.log('client disconnected:' + socket.id);
			  socket.removeListener('create', retrievePastebin);
			} catch(err) {
			  console.log(err);
			}		
		  });
	});
	return router;
}

module.exports = pbRouter;

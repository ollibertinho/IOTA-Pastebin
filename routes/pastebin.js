var express = require('express');
var router = express.Router();
var SimpleMAM = require('simplified-mam-lib');

function fetchPastebin(address, io, iota, socketId) {
	try 
	{			
		var fetchData = new SimpleMAM.MAMFetchData(iota, address);		
		SimpleMAM.MAMLib.fetchMessages(fetchData, function(msg) {
		    try {
    			var jsonObj = JSON.parse(msg);
    			jsonObj.address = address;
    			io.to(socketId).emit('retrieved', jsonObj);
		    } catch(e) {
        	  console.log('exception:'+e);
        	  io.to(socketId).emit('error', e);
        	}
		}).catch(err => {
			console.log('exception:'+err);
			io.to(socketId).emit('error', err.message);
		});		
	} catch(e){
	  console.log('exception:'+e);
	  io.to(socketId).emit('error', e);
	}	
}

router.get('/pb_:id', function(req, res, next) {
	
	var iota = req.iota;
	var io = req.io;
	var db = req.db;
	var id = req.params.id;

	console.log("io", io);
	console.log("PARAMS",req.params);

	io.on('connection', function(socket)
	{
	    socket.on('retrieve', retrievePastebin);
	    function retrievePastebin(pastebinData)
		{
		    console.log("Retrieving on serverside...",req.params);
    		try 
    		{	
    			if(id == null) {
    			    console.log("Retrieve not possible. No pastebin-id provided.");
    				io.to(socket.id).emit('retrieveNotPossible', 'No pastebin-id provided.');
    			} else {
    				console.log("find long Id of", id);
    				db.collection('addresses').findOne({shortid: id}, 'address').then((doc) => {					
    					//console.log("DOC", doc);										
    					if(doc.address != null) {
    					    console.log("start fetching", doc.address);
    						fetchPastebin(doc.address, io, iota, socket);
    					}
    				});
    			}
    		} catch(e) {
    			console.log('exception:'+e);
    			io.to(socket.id).emit('error', e);		  
    		}
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
				fetchPastebin(address, io, iota, socket);
			}	
		} catch(e) {
		  console.log('exception:'+e);
		  io.to(socket.id).emit('error', e);
		}
	})
	res.render('pastebin');
});

module.exports = router;

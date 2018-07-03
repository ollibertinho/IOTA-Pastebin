var express = require('express');
var router = express.Router();
var SimpleMAM = require('simplified-mam-lib');

router.get('/pb_:id', function(req, res, next) {
	var iota = req.iota;
	var io = req.io;
	var db = req.db;
	var id = req.params.id;
	io.on('connection', function(socket)
	{
		try 
		{
			var address = null;
			console.log("PARAMS",req.params);
			if(id ==  null) {
				io.to(socket.id).emit('retrieveNotPossible', 'No pastebin-id provided.');
			}else {
				console.log("find long Id of", id);
				db.collection('addresses').findOne({shortid: id}, 'address').then((doc) => {
					address = doc.address;
					console.log("DOC", doc);
				});
				
				console.log("ADDRESS OF ID",address);
				if(address!=null) {
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
				}else {
					io.to(socket.id).emit('retrieveNotPossible', 'No pastebin-id provided.');
				}
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
	var shortId = req.params.id;
	var longId = req.query.id;
	var db = req.db;

	console.log("PARAMS",req.params);
	console.log("LONGID", longId);
	console.log("SHORTID", shortId);

	io.on('connection', function(socket)
	{
		try 
		{
			socket.on('retrieve', retrievePastebin);
			
			function retrievePastebin(pastebinData)
			{		
				if(longId==null) {
					if(shortId==null) {
						io.to(socket.id).emit('retrieveNotPossible', 'No pastebin-id provided.');
						return;
					}else {
						console.log("find long Id of", shortId);
						db.collection('addresses').findOne({shortid: shortId}, 'address').then((doc) => {
							longId = doc.address;
							console.log("DOC", doc);
						})				
					}
				}

				console.log(longId);
				try 
				{			
					var fetchData = new SimpleMAM.MAMFetchData(iota, longId);
					
					SimpleMAM.MAMLib.fetchMessages(fetchData, function(msg) {
						var jsonObj = JSON.parse(msg);
						jsonObj.address = longId;
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
		} catch(e) {
		  console.log('exception:'+e);
		  io.to(socket.id).emit('error', e.message);
		}
	})
	res.render('pastebin');
});

module.exports = router;

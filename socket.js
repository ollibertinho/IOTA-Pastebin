var socketIo = require('socket.io');
var SimpleMAM = require('simplified-mam-lib');
var shortid = require("shortid");
var io = new socketIo();

var ioServer = function(db, iota) {
    io.on('connection', function(socket) {
       
        console.log('client connected:' + socket.id);

        socket.on('create', createPastebin);
        socket.on('retrieve', retrievePastebin);
    
        socket.on('disconnect', function(){		
            try {
              console.log('client disconnected ' + socket.id);
              socket.removeListener('create', retrievePastebin);
              socket.removeListener('retrieve', retrievePastebin);
            } catch(err) {
              console.log(err);
            }		
        });       

        function createPastebin(pastebinData) {		
            console.log("Create Pastebin serverside...");
            try 
            {	
            if(pastebinData.source == "ERROR") {
                tryCreate();
            }
            
            tryToCreate(pastebinData);
                            
            } catch(e){
            console.log('function createPastebin(pastebinData) exception:'+e);
            io.to(socket.id).emit('error', e.message);
            }
        }
        
        function createSeed() {
            const seedsize = 81;
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9";
            let seed = "";
            for (var i = 0, n = chars.length; i < seedsize; ++i) {
                seed += chars.charAt(Math.floor(Math.random() * n));
            }
            return seed;
        }
  
        function tryToCreate(pastebinData) {
          
          counter = 0;
          var secondsCnt = setInterval(function () {
            ++counter;
          }, 1000);

          var seed = createSeed();
          var mam = new SimpleMAM.MAMLib(iota, seed, true);
          var x = mam.publishMessage(JSON.stringify(pastebinData), function(err, data) {
            if (err) {
                console.log("ERROR Publishing", err);
                io.to(socket.id).emit('error', err.message);
            } else {    
                clearInterval(secondsCnt);
                console.log("### Publishing OK!");
                data.shortid = shortenUrl(data.root, counter);
                io.to(socket.id).emit('created', data);              
            }
          }).then(() => { })
          .catch(err => { })
        }
      
        function shortenUrl(id, counter) {
          const urlCode = shortid.generate();
          console.log("elapsed sec.", counter);
          var doc = { "shortid":urlCode, "address":id, "elapsed": counter, "timestamp": new Date(Date.now()).toISOString() };
          console.log("SHORTEN", doc);
          db.collection('addresses').insert(doc, function (err, result) {
            if (err) {
              io.to(socket.id).emit('error','Failed to create short-url.');
              console.log(err);
            } else {
              console.log('INSERTED', doc);
            }
          });   
          return urlCode;   
        }

        function retrievePastebin(pastebinData) {
            try 
            {	
                if(shortId == null && address == null) {
                    console.log("Retrieve not possible. No pastebin-id provided.");
                    io.to(socket.id).emit('retrieveNotPossible', 'No Pastebin-ID provided.');
                } else {
                
                    if(shortId != null) {
                        console.log("find long Id of", shortId);
                        db.collection('addresses').findOne({shortid: shortId}, 'address').then((doc) => {	
                            try {				
                                address = doc.address;	
                                if(address != null) {
                                    console.log("start fetching", address);
                                    fetchPastebin(address, io, iota, socket.id, shortId);
                                }else {
                                    console.log("find long Id failed...");
                                    io.to(socket.id).emit('retrieveNotPossible', 'Unknown-ID.');
                                }
                            } catch(err) {
                                console.log('exception:' + err);
                                io.to(socket.id).emit('retrieveNotPossible', err.message);		  
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
            } catch(err) {
                console.log('exception:'+err);
                io.to(socket.id).emit('retrieveNotPossible', err.message);		  
            }
        }

        function fetchPastebin(address, io, iota, socketId, shortId) {
            try 
            {
                var fetchData = new SimpleMAM.MAMFetchData(iota, address);		
                SimpleMAM.MAMLib.fetchMessages(fetchData, function(msg) {
                    try {
                        var jsonObj = JSON.parse(msg);
                        jsonObj.shortid = shortId;
                        jsonObj.address = address;
                        console.log("RETRIEVED");
                        io.to(socketId).emit('retrieved', jsonObj);
                    } catch(err) {
                    console.log('exception:'+err);
                    io.to(socketId).emit('retrieveNotPossible', err.message);
                    }
                }).catch(err => {
                    console.log('exception:'+err);
                    io.to(socketId).emit('retrieveNotPossible', err.message);
                });		
            } catch(err){
                console.log('exception:'+err);
                io.to(socketId).emit('retrieveNotPossible', err.message);
            }	
        }
    });
    return io;
};

module.exports = ioServer;
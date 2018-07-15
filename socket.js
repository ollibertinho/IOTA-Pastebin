var socketIo = require('socket.io');
var SimpleMAM = require('simplified-mam-lib');
var shortid = require("shortid");
var io = new socketIo();

var ioServer = function(mongo, iota) {

    var clients = [];

    function deleteFromArray(array, element) {
        position = array.indexOf(element);
        array.splice(position, 1);
    }

    io.on('connection', function(socket) {
       
        console.log('client connected:' + socket.id);

        clients.push(socket.id);

        socket.on('create', createPastebin);
        socket.on('retrieve', retrievePastebin);
    
        socket.on('disconnect', function(){		
            try {
              console.log('client disconnected ' + socket.id);
              socket.removeListener('create', createPastebin);
              socket.removeListener('retrieve', retrievePastebin);
              deleteFromArray(clients, socket.id);
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
                //Workaround for misconfigured field nodes
                //const fieldMisconfError = "Request Error";
                //if (err.message.indexOf(fieldMisconfError) !== -1) {
                    console.log("RETRY Publishing", socket.id);
                    io.to(socket.id).emit('errorinfo', err.message);

                    tryToCreate(pastebinData);
                //} else {
                //   io.to(socket.id).emit('error', err.message);
                //}               
            } else {    
                clearInterval(secondsCnt);
                console.log("### Publishing OK!", data.root);
                shortenUrl(data.root, counter).then((shortId)=>
                {
                    console.log("SHORTEN URL",shortId);
                    data.shortid = shortId;
                    io.to(socket.id).emit('created', data);              
                });
            }
          }).then(() => { })
          .catch(err => {
            io.to(socket.id).emit('error', err.message);
           })
        }
      
        function shortenUrl(id, counter) {
            const urlCode = shortid.generate();
            console.log("elapsed sec.", counter);
            var doc = { "shortid":urlCode, "address":id, "elapsed": counter, "timestamp": new Date(Date.now()).toISOString() };

            var inserted = mongo.insert(doc);
            return inserted.then(success=>
            {
                if(!success) {
                    console.log('Failed to create short-url.');
                    io.to(socket.id).emit('error','Failed to create short-url.');
                }
            }).then(()=>
            { 
                return urlCode;
            });          
        }

        function retrievePastebin(retrieveData) {
            console.log(retrieveData);
            let address = retrieveData.address;
            let shortId = retrieveData.shortId;
            try 
            {	
                if(shortId == null && address == null) {
                    console.log("Retrieve not possible. No pastebin-id provided.");
                    io.to(socket.id).emit('retrieveNotPossible', 'No Pastebin-ID provided.');
                } else {                
                    if(shortId != null) {              
                        mongo.getAddressOfShortId(shortId).then((addr)=>{
                            if(addr != null) {
                                fetchPastebin(addr, io, iota, socket.id, shortId);
                            } else {
                                io.to(socket.id).emit('retrieveNotPossible', 'Unknown-ID...');
                            }
                        })
                        
                    } else {
                        mongo.getShortIdOfAddress(address).then((sid)=>{
                            if(sid!=null) {
                                fetchPastebin(address, io, iota, socket.id, sid);
                            } else {
                                io.to(socket.id).emit('retrieveNotPossible', 'Unknown Root-Address...');		
                            }    
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

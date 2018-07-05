var express = require('express');
var shortid = require("shortid");

var router = express.Router();
var SimpleMAM = require('simplified-mam-lib');

function createSeed(){
  const seedsize = 81;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ9";
  let seed = "";
  for (var i = 0, n = chars.length; i < seedsize; ++i) {
      seed += chars.charAt(Math.floor(Math.random() * n));
  }
  return seed;
}

var indexRouter = function(io, iota, db) {

  router.get('/', function(req, res, next) {
    db.collection("addresses").count({}, function(error, numOfDocs){
      if(error){
        res.render('index',  { pasteCnt: "unknown" });
      }else {
        db.close();
        res.render('index',  { pasteCnt: numOfDocs }); 
       }     
    });  
  });

  io.on('connection', function(socket)
  {
    try 
    {
      console.log('client connected:' + socket.id);

      socket.on('create', createPastebin);
    
      socket.on('disconnect', function(){		
        try {
          console.log('client disconnected:' + socket.id);
          socket.removeListener('create', createPastebin);
        } catch(err) {
          console.log(err);
        }		
      });
      
      function createPastebin(pastebinData)
      {		
        console.log("Create Pastebin serverside...");
        try 
        {			
          var seed = createSeed();
          var mam = new SimpleMAM.MAMLib(iota, seed, true);
          mam.publishMessage(JSON.stringify(pastebinData), function(err, data) {
            if (err) {
              console.log("ERROR Publishing", err);
              io.to(socket.id).emit('error', err.message);
            } else {    
                console.log("### Publishing OK!");
                data.shortid = shortenUrl(data.root);
                io.to(socket.id).emit('created', data);
            }
          });	           
        } catch(e){
          console.log('function createPastebin(pastebinData) exception:'+e);
          io.to(socket.id).emit('error', e.message);
        }
      }

      function shortenUrl(id) {
        const urlCode = shortid.generate();
        var doc = { "shortid":urlCode, "address":id };
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
    }
    catch(e) 
    {
      console.log('exception:'+e);
      io.to(socket.id).emit('error', e.message);
    }
  })

  return router;
}

module.exports = indexRouter;
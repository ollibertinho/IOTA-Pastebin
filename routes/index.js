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
      console.log('client connected (index):' + socket.id);

      socket.on('create', createPastebin);
    
      socket.on('disconnect', function(){		
        try {
          console.log('client disconnected (index):' + socket.id);
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
          if(pastebinData.source=="ERROR") {
            tryCreate();
          }
         
          tryToCreate(pastebinData);
          	           
        } catch(e){
          console.log('function createPastebin(pastebinData) exception:'+e);
          io.to(socket.id).emit('error', e.message);
        }
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
        }).then(() => {
          console.log("X2", x);
        })
        .catch(err => {
          console.log("X", err);
        })
        console.log("X", x);
      }
    
      function shortenUrl(id, counter) {
        const urlCode = shortid.generate();
        console.log("elapsed sec.", counter);
        var doc = { "shortid":urlCode, "address":id, "elapsed": counter };
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
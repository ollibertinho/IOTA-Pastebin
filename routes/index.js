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

router.get('/', function(req, res, next) {

  var io = req.io;
  var iota = req.iota;
  var db = req.db;

  io.on('connection', function(socket)
  {
    try 
    {
      socket.on('create', createPastebin);
      
      socket.on('disconnect', function(){		
        try {
          console.log('client disconnected:'+socket.id);
          socket.removeListener('create', createPastebin);
        } catch(err) {
          console.log(err);
        }		
      });
      
      function createPastebin(pastebinData)
      {		
        console.log(pastebinData);
        try 
        {			
          var seed = createSeed();
          var mam = new SimpleMAM.MAMLib(iota, seed, true);
          mam.publishMessage(JSON.stringify(pastebinData), function(err, data) {
            if (err) {
              console.log(err);
              io.to(socket.id).emit('error', err.message);
            } else {    
               console.log(data);
               data.shortid = shortenUrl(data.root);
               io.to(socket.id).emit('created', data);
            }
          });	           
        } catch(e){
          console.log('exception:'+e);
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
  res.render('index');
});

module.exports = router;
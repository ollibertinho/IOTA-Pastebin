var express = require('express');
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
            } else {    
               console.log(data);          
               io.to(socket.id).emit('created', data);	
            }
          });	           
        } catch(e){
          console.log('exception:'+e);
          io.to(socket.id).emit('error', e.message);
        }
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
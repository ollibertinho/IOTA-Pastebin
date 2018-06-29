var express = require('express');
var router = express.Router();
var fs = require('fs');
var subdomain = require('express-subdomain');
var http = require('http');
var https = require('https');
var SimpleMAM = require('simplified-mam-lib');
var IOTA = require('iota.lib.js');

//var iota = new IOTA({ provider: 'http://localhost:14265' })
var iota = new IOTA({ provider: 'https://field.carriota.com:443' });

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

  io.on('connection', function(socket)
  {
    try 
    {
      //countUser(socket.id);
      
      socket.on('create', createPastebin);
      
      socket.on('disconnect', function(){		
        try {
          console.log('client disconnected:'+socket.id);
          socket.removeListener('create', createPastebin);
          //countdeleteFromArray(clients, socket.id);
        }catch(err) {
          console.log(err);
        }		
      });
      
      function createPastebin(pastebinData)
      {		
        console.log(pastebinData);
        try 
        {			
          //Exmpmle publishing
          var iota = new IOTA({ provider: "https://field.carriota.com:443" });
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
        }
        catch(e) 
        {
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
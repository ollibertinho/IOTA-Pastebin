var express = require('express');
var router = express.Router();
var SimpleMAM = require('simplified-mam-lib');

router.get('/', function(req, res, next) {

    //var root = "9HDASXULRQSZPGIPXXKFSQZCIVMA9XPLDBCWSBAQHUZDDNSPDANJZANOKIXLFUZIXGIDOMNHZBXUOGOSO";
    var iota = req.iota;
    var root = req.query.id;
    var fetchData = new SimpleMAM.MAMFetchData(iota, root);
    SimpleMAM.MAMLib.fetchMessages(fetchData, function(msg) {
        res.render('pastebin', { source: 'HELLO DARKNESS MY OLD FRIEND', title: 'My first pastebin!', type: 'JSON'});
        console.log("Message fetched... ", msg);
    }).catch(err => {
        res.render('pastebin', { source: err });//, title: 'My first pastebin!', type: 'JSON'});
    });

    //res.render('pastebin', { source: 'HELLO DARKNESS MY OLD FRIEND', title: 'My first pastebin!', type: 'JSON'});
    //res.render('pastebin');
    //res.send(req.query.id);
});

module.exports = router;

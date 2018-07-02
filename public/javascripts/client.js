var clientSocket;

$(document).ready(function() {	

	var port = location.protocol === 'https:' ? 8444 : 8082;
	// var connString = location.protocol+"//pastebin.tangle.army";
	var connString = location.protocol+"//127.0.0.1:8082";         
	clientSocket = io.connect(connString);
	
	clientSocket.on('connect', function() { 
		console.log('connected');
		//getCurrentlyConnected();
		//showHint("success", "INFO", "Successfully connected...");
		//var addr = getUrlParameter('address');
		//if(addr!=null) {
		//	doFetch(addr, '');
		//}
	});
	
	clientSocket.on('error', function(exception){
		//showHint("error", "ERROR", 'Exception:' + exception);
		console.log('exception: ' + exception);
		//stopFetching();
	});

	clientSocket.on('disconnect', function(){
		console.log('disconnected');
		//showHint("info", "INFO", "Disconnected...");
	});	
});
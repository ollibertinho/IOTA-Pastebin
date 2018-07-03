var clientSocket;

$(document).ready(function() {	

	toastr.options = {
		"closeButton": true,
		"debug": false,
		"newestOnTop": true,
		"progressBar": false,
		"positionClass": "toast-bottom-right",
		"preventDuplicates": false,
		"onclick": null,
		"showDuration": "300",
		"hideDuration": "1000",
		"timeOut": "5000",
		"extendedTimeOut": "1000",
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "fadeIn",
		"hideMethod": "fadeOut"
	}

	var port = location.protocol === 'https:' ? 8444 : 8082;
	var connString = location.protocol+"//pastebin.tangle.army";
	//var connString = location.protocol+"//127.0.0.1:8082";         
	clientSocket = io.connect(connString);
	
	clientSocket.on('connect', function() { 
		console.log('connected');
		//getCurrentlyConnected();
		showHint("success", "INFO", "Successfully connected...");
		//var addr = getUrlParameter('address');
		//if(addr!=null) {
		//	doFetch(addr, '');
		//}
	});
	
	clientSocket.on('error', function(exception){
		showHint("error", "ERROR", 'Exception:' + exception);
		console.log('exception: ' + exception);
		//stopFetching();
	});

	clientSocket.on('disconnect', function(){
		console.log('disconnected');
		showHint("info", "INFO", "Disconnected...");
	});	

	function copyToClipboard(element) {
		var $temp = $("<input>");
		$("body").append($temp);
		$temp.val($(element).text()).select();
		document.execCommand("copy");
		$temp.remove();
	  }

	$('#donationAddress').click(function()
	{
	   copyToClipboard($('#donationAddress'));
	   showHint("success", "Address copied to clipboard", $('#donationAddress').html());
	});

	function showHint(type, title, text) 
	{
		console.log(text);
		toastr[type](text, title);
	}
});
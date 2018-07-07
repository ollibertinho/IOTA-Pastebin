var clientSocket;

function copyToClipboard(element) 
{
	var $temp = $("<input>");
	$("body").append($temp);
	$temp.val($(element).text()).select();
	document.execCommand("copy");
	$temp.remove();
}

function showHint(type, title, text) 
{
	console.log(text);
	toastr[type](text, title);
}

$(document).ready(function() {	
	
	try {
		var port = location.protocol === 'https:' ? 8444 : 8082;
		//var connString = location.protocol+"//pastebin.tangle.army";
		var connString = location.protocol+"//127.0.0.1:8082"; 
		
		clientSocket = io.connect(connString);  

		clientSocket.on('connect', function() { 
			console.log('connected');
			showHint("success", "INFO", "Successfully connected...");		
		});
		
		clientSocket.on('error', function(exception){
			console.log('exception: ' + exception);
			showHint('error', "ERROR", exception);
    	});
	
		clientSocket.on('disconnect', function(){
			console.log('disconnected');
			showHint("info", "INFO", "Disconnected...");
		});	

	} catch(e) {
		console.log("SOCKET ERROR",e);
		showHint('error', "ERROR", e);
		$('#loader').hide();
	}

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
		
	$('#donationAddress').click(function()
	{
	   copyToClipboard($('#donationAddress'));
	   showHint("success", "Address copied to clipboard", $('#donationAddress').html());
	});

});
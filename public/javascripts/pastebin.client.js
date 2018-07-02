$(document).ready(function() {	

	$('#loader').hide();

	function getUrlParameter(sParam) {
		var sPageURL = decodeURIComponent(window.location.search.substring(1)),
			sURLVariables = sPageURL.split('&'),
			sParameterName,
			i;

		for (i = 0; i < sURLVariables.length; i++) {
			sParameterName = sURLVariables[i].split('=');

			if (sParameterName[0] === sParam) {
				return sParameterName[1] === undefined ? true : sParameterName[1];
			}
		}
	};
	
	if(getUrlParameter("id")!=null) 
	{		
		var iota = new IOTA();
		var id = getUrlParameter("id");
		if(iota.valid.isAddress(id)==false)
		{
			console.log("Cannot retrieve pastebin. Invalid pastebin-address.");
			//showHint('error', "ERROR", "Cannot retrieve pastebin. Invalid pastebin-address.");
			return;
		}
		$('#loader').show();
		clientSocket.emit('retrieve', { "id":id });
	}

	clientSocket.on('retrieved', function(msg)
	{
		console.log("retrieved",msg);
		$('#loader').hide();
		try 
		{
			$('#pasteBinSource').html(msg);
			//$('.modal').modal('hide');
		} catch(e) {
			console.log(e);
			$('#loader').hide();
			//showHint('error', "ERROR", e.message);
			//stopFetching();
		}
	});	
});
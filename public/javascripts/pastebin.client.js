$(document).ready(function() {	

	//$('#loader').hide();
	
	/*function getUrlParameter(sParam) {
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
	};*/
		
	/*if(getUrlParameter("id") != null) 
	{
		var iota = new IOTA();
		var id = getUrlParameter("id");
		if(iota.valid.isAddress(id) == false)
		{
			console.log("Cannot retrieve pastebin. Invalid pastebin-address.");
			showHint('error', "ERROR", "Cannot retrieve pastebin. Invalid pastebin-id.");
			return;
		}
		$('#loader').show();
		clientSocket.emit('retrieve', { "id":id });
	}*/

	$('#loader').show();
	clientSocket.emit('retrieve', { });

	$('#pasteBinUrl').click(function()
	{
	   copyToClipboard($('#pasteBinUrl'));
	   showHint("success", "Url copied to clipboard", $('#pasteBinUrl').html());
	});

	$('#pasteBinShortenedUrl').click(function()
	{
	   copyToClipboard($('#pasteBinShortenedUrl'));
	   showHint("success", "Url copied to clipboard", $('#pasteBinShortenedUrl').html());
	});

	clientSocket.on('retrieveNotPossible', function(msg)
	{
		$('#loader').hide();
		console.log("retrieveNotPossible",msg);
		var redirect ="/";
		window.location.replace(redirect);
	});

	clientSocket.on('retrieved', function(msg)
	{
		console.log("retrieved",msg);
		$('#loader').hide();
		try 
		{
			var id = msg.address;
			var source = msg.source;
			var syntax = msg.syntax;
			var title = msg.title;
			var genId = msg.shortid;

			$('#pasteBinTitle').text(title);
			$('#pasteBinSource').text(source);
			$('#pasteBinUrl').text('http://pastebin.tangle.army/pb?id='+id);
			if(genId!=null) {
				$('#pasteBinShortenedUrl').text('http://pastebin.tangle.army/id_'+genId);
			}
			
			if(syntax!=null) {
				$('#pasteBinSource').addClass(syntax);
			}
			$('#pasteBinSource').each(function(i, block) {
				hljs.highlightBlock(block);
			});			
		} catch(e) {
			console.log(e);
			$('#loader').hide();
			showHint('error', "ERROR", e.message);		
		}
	});	
});
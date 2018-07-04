$(document).ready(function() {	

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
	
	$('#loader').show();
	console.log("retrieve...");
	clientSocket.emit('retrieve', { });
});
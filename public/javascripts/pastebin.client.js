$(document).ready(function() {	

	function copyToClipboard(element) {
		var $temp = $("<input>");
		$("body").append($temp);
		$temp.val($(element).text()).select();
		document.execCommand("copy");
		$temp.remove();
	}

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
		console.log("retrieveNotPossible", msg);
		if(msg!=null) {
			showHint("error", "Retrieving failed!", msg);
			setTimeout(() => {
				var redirect ="/";
				window.location.replace(redirect);				
			  }, 2500);
		} else {
			var redirect ="/";
			window.location.replace(redirect);
		}
	});

	clientSocket.on('retrieved', function(msg)
	{
		console.log("retrieved",msg);
		$('#bincontainer').show();
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
			$('#pasteBinUrl').text('http://paste.tangle.army/p?id='+id);
			$('#pasteBinRoot').html(id + "&nbsp;(<a href ='https://mam.tangle.army/fetch?address="+id+"' target='_blank'>Show in explorer</a>)");
			if(genId!=null) {
				$('#pasteBinShortenedUrl').text('http://paste.tangle.army/p_'+genId);
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
	$('#bincontainer').hide();
	console.log("retrieve...");
	clientSocket.emit('retrieve', { });
});
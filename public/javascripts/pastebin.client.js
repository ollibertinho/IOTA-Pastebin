$(document).ready(function() {	

	function copyToClipboard(element) {
		var $temp = $("<input>");
		$("body").append($temp);
		$temp.val($(element).text()).select();
		document.execCommand("copy");
		$temp.remove();
	}

	function ParsedUrl(url) {
		var parser = document.createElement("a");
		parser.href = url;
		
		// IE 8 and 9 dont load the attributes "protocol" and "host" in case the source URL
		// is just a pathname, that is, "/example" and not "http://domain.com/example".
		parser.href = parser.href;
		
		// IE 7 and 6 wont load "protocol" and "host" even with the above workaround,
		// so we take the protocol/host from window.location and place them manually
		if (parser.host === "") {
			var newProtocolAndHost = window.location.protocol + "//" + window.location.host;
			if (url.charAt(1) === "/") {
				parser.href = newProtocolAndHost + url;
			} else {
				// the regex gets everything up to the last "/"
				// /path/takesEverythingUpToAndIncludingTheLastForwardSlash/thisIsIgnored
				// "/" is inserted before because IE takes it of from pathname
				var currentFolder = ("/"+parser.pathname).match(/.*\//)[0];
				parser.href = newProtocolAndHost + currentFolder + url;
			}
		}
		
		// copies all the properties to this object
		var properties = ['host', 'hostname', 'hash', 'href', 'port', 'protocol', 'search'];
		for (var i = 0, n = properties.length; i < n; i++) {
		  this[properties[i]] = parser[properties[i]];
		}
		
		// pathname is special because IE takes the "/" of the starting of pathname
		this.pathname = (parser.pathname.charAt(0) !== "/" ? "/" : "") + parser.pathname;
	}
	
	function getAddress(url) {
		var myUrl = new ParsedUrl(url);
		console.log(myUrl);
		if(myUrl.search!=null && myUrl.search.indexOf("?id=")!=-1) {
			console.log(myUrl.search.split("?id=")[1]);
			return myUrl.search.split("?id=")[1];
		}
	}

	function getShortId(url) {
		var myUrl = new ParsedUrl(url);
		if(myUrl.pathname!=null && myUrl.pathname.indexOf("/p_")!=-1) {
			return myUrl.pathname.split("/p_")[1];
		}
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
			$('#pasteBinUrl').text('https://paste.tangle.army/p?id='+id);
			$('#pasteBinRoot').html(id + "&nbsp;(<a href ='https://mam.tangle.army/fetch?address="+id+"' target='_blank'>Show in explorer</a>)");
			if(genId!=null) {
				$('#pasteBinShortenedUrl').text('https://paste.tangle.army/p_'+genId);
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
	let retrieveData = { "address": getAddress(window.location.href), "shortId": getShortId(window.location.href)};
	console.log("retrieve", retrieveData);
	clientSocket.emit('retrieve', retrieveData);
});
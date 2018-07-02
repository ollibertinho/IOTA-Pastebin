$(document).ready(function() {	

    var isRestricted = false;
    var syntaxType = null;

    $("#pwdSidekey").hide();

    $("#setrestricted").click(function() {
      isRestricted=true;
      $("#pwdSidekey").show();
      $("#btnRestrictionType").html('Restricted');	
    });

    $("#setpublic").click(function() {
      isRestricted=false;
      $("#pwdSidekey").hide();
      $("#btnRestrictionType").html('Public');				
    });

    $("[id^=sh_]").click(function(event) {
      syntaxType = event.target.id;
      console.log(syntaxType);
      $("#syntaxhighlightType").html($("#"+syntaxType).html());	  
    });
		
    $('#btnCreatePastebin').click(function(){
        $('.modal').modal('show');
   
        var source = $('#txtSoure').val();
		var type = $("#btnRestrictionType").html();
		if(type.trim()=="Syntaxhighlighting?") {
			type = null;
		}
        var passwd =  $("#pwdSidekey").val();
        var syntax =  $("#syntaxhighlightType").html();
        var title =$('#txtTitle').val();
        console.log('create bin', title, source, type, passwd, syntax);
        clientSocket.emit('create', { "title":title, "source":source, "type":type, "passwd":passwd, "syntax":syntax });
    });
	
	clientSocket.on('created', function(msg)
	{
		console.log("CREATED",msg);
		try 
		{
			$('.modal').modal('hide');
			var redirect ="/pastebin?id=" + msg.root;
			window.location.replace(redirect);
		} catch(e) {
			console.log(e);
			//showHint('error', "ERROR", e.message);			
		}
	});
});
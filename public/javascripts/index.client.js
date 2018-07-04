$(document).ready(function() {	

    var isRestricted = false;
    var syntax = null;

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
      syntax = event.target.id;
      if(syntax!=null) {
        syntax = syntax.substring(3);
        console.log(syntax);
        $("#btnSyntaxhighlightType").html($("#"+event.target.id).html());	  
      }      
    });
		
    $('#btnCreatePastebin').click(function(){
        $('.modal').modal('show');
        console.log(syntax);
        var source = $('#txtSoure').val();
		    var type = $("#btnRestrictionType").html();
        var passwd =  $("#pwdSidekey").val();
        var title =$('#txtTitle').val();
        console.log('create', title, source, type, passwd, syntax);
        clientSocket.emit('create', { "title":title, "source":source, "type":type, "passwd":passwd, "syntax":syntax });
    });
	
	clientSocket.on('created', function(msg)
	{
		console.log("CREATED",msg);
		try 
		{
			//$('.modal').modal('hide');
			$('modal-content').html("/pb_" + msg.shortid);
			
			//var redirect ="/pb_" + msg.shortid;
			//window.location.replace(redirect);
		} catch(e) {
			console.log(e);
			showHint('error', "ERROR", e.message);
		}
	});
});
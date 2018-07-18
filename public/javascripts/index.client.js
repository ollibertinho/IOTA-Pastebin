$(document).ready(function() {	

    var isRestricted = false;
    var syntax = null;

    $("#pwdSidekey").hide();
    hideLoader();
    
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
      try 
      {
        console.log(syntax);
        var source = $('#txtSoure').val();
		    var type = $("#btnRestrictionType").html();
        var passwd =  $("#pwdSidekey").val();
        var title =$('#txtTitle').val();
        console.log('create', title, source, type, passwd, syntax);
        if(source==null || source=='') {
          showHint("error", "ERROR", "Paste empty source isn't possible!");
          return;
        }
        showLoader();
        clientSocket.emit('create', { "title":title, "source":source, "type":type, "syntax":syntax, "coding":"base64" });
      } catch(e) {
        console.log(e);
        showHint('error', "ERROR", e.message);
        hideLoader();
      }
    });

    clientSocket.on('created', function(msg)
    {
      console.log("CREATED",msg);
      try 
      {
          hideLoader();
          var redirect ="/p_" + msg.shortid;
          window.location.replace(redirect);
      } catch(e) {
        console.log(e);
        showHint('error', "ERROR", e.message);
        hideLoader();
      }
    });
    
    clientSocket.on('error', function(exception){
      hideLoader();
    });

    clientSocket.on('errorinfo', function(exception){
        showHint("warning", "RETRY", exception);
    });

    function showLoader() {
      $('#loader').show();
      $('#txtSoure').prop('disabled', true);
      $('#btnRestrictionType').prop('disabled', true);
      $('#txtTitle').prop('disabled', true);
      $('#pwdSidekey').prop('disabled', true);
      $('#btnSyntaxhighlightType').prop('disabled', true);
      $('#btnCreatePastebin').prop('disabled', true);
    }

    function hideLoader() {
      $('#loader').hide();
      $('#txtSoure').prop('disabled', false);
      $('#btnRestrictionType').prop('disabled', false);
      $('#txtTitle').prop('disabled', false);
      $('#pwdSidekey').prop('disabled', false);
      $('#btnSyntaxhighlightType').prop('disabled', false);
      $('#btnCreatePastebin').prop('disabled', false);
    }
});
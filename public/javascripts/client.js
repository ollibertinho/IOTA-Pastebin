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
        
        var port = location.protocol === 'https:' ? 8444 : 8082;
        // var connString = location.protocol+"//pastebin.tangle.army";
        var connString = location.protocol+"//127.0.0.1:8082";         
        var socket = io.connect(connString);

        socket.on('connect', function() { 
            console.log('connected');
            //getCurrentlyConnected();
            //showHint("success", "INFO", "Successfully connected...");
            //var addr = getUrlParameter('address');
            //if(addr!=null) {
            //	doFetch(addr, '');
            //}
        });
        
        socket.on('error', function(exception){
            //showHint("error", "ERROR", 'Exception:' + exception);
            console.log('exception: ' + exception);
            //stopFetching();
        });
    
        socket.on('disconnect', function(){
            console.log('disconnected');
            //showHint("info", "INFO", "Disconnected...");
        });	
        
        socket.on('created', function(msg)
        {
            console.log("CREATED",msg);
            try 
            {
                $('.modal').modal('hide');
            } catch(e) {
                console.log(e);
                //showHint('error', "ERROR", e.message);
                //stopFetching();
            }
        });

        var source = $('#txtSoure').val();
        var type = $("#btnRestrictionType").html();
        var passwd =  $("#pwdSidekey").val();
        var syntax =  $("#syntaxhighlightType").html();
        var title =$('#txtTitle').val();
        console.log('create bin', title, source, type, passwd, syntax);
        socket.emit('create', { "title":title, "source":source, "type":type, "passwd":passwd, "syntax":syntax });
    });
});
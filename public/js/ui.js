function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}

function setPeer(socket){
	var user;
	var option;

	try {	
		option= $("#peers").find(':selected');
		user= {
			  start_id: socket.id
			, end_name: option.text() 
			, end_id: option.val()
		}	
		return user;
		    
	} catch(e) {
		console.log(e);
	}	
} 

function sendText(wschannel, message, event){
	try {
		
		// 1.- Process Command (entry starting with /)
		//---------------------
		if (message[0] == '/') {
			   systemMessage = wschannel.processCommand(message);
			   if (systemMessage) {$('#messages').append(divSystemContentElement(systemMessage));}
		
		// 2.- Broadcast rest of messages
		//---------------------
		  } else {
			
			// 2.1.- Send Message  
			if(event=='Private') {wschannel.sendPeerMessage(message);}
		  	else                 {wschannel.sendMessage($('#room').text(), message);}
			
			// 2.2.- Update the GUI
		  	$('#messages').append(divEscapedContentElement(message));
		    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
		  }
		
		  $('#send-message').val('');
		
	} catch(e) {
		console.log(e);
	}
} 

function processSubmit(wschannel, event, user) {

	//------------ LOCAL ENVIRONMENT -------------		
	  var message, systemMessage;
	  var currentEvent;
	  var message;
	  
	//----------------- ACTIONS ----------------		
	try { 
	
	  // 1.- Capture form values
	  //------------------------
	  currentEvent= $(document.activeElement).val();
	  console.log("Current Event:", currentEvent);
	
	  // 2.- Process submit
	  //-------------------
	  switch(currentEvent) {
	  
	    case "Private":
	    	message= $('#private-message').val();
	        sendText(wschannel, message, currentEvent);
	        break;
	  
	    case "Video-Conference":
	        sendRequest(wschannel, user);
	        break;
	    default:
	    	message= $('#send-message').val();
	        sendText(wschannel,message);
	    	break;
	  } 
	  	  
	} catch (e) {
		console.log(e);
	} 
}


function printFiles(files) {
	var output = [];
    for (var i = 0, f; f = files[i]; i++) {
        output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                    f.size, ' bytes, last modified: ',
                    f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
                    '</li>');
      }
      document.getElementById('list-files').innerHTML = '<ul class="files">' + output.join('') + '</ul>';
	
}



function onFileSelect(evt) {
	var files;

	try {
	    files = evt.target.files; // FileList object
		printFiles(files);
		return files;
	} catch(e) {
		console.log("ui.onFileSelect - ERROR ", e);
	}   
}

function onDropFileSelect(evt) {
	var files;
	
	try {
		evt.stopPropagation();
	    evt.preventDefault();
	    files = evt.dataTransfer.files; // FileList object.
	    printFiles(files);
	} catch(e) {
		console.log("ui.onDropFileSelect - ERROR ", e);
	}
}

function onDragOver(evt) {
	try {	
	   evt.stopPropagation();
	   evt.preventDefault();
	   evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
	} catch(e) {
		console.log("ui.onDragOver - ERROR ", e);
	}	   
}


function sendFileDatachannel(session, files, evt) {
	try {	
		var progress = document.querySelector('.percent');
		
		for (var i = 0, f; f = files[i]; i++) {
			
			console.log("ui.sendFileDatachannel() - INFO: Trying to send file over data channel", f);
			progress.style.width = '0%';
			progress.textContent = '0%';
			session.sendDatachannel(f, 'file');
		}
		
	} catch(e) {
		console.log("ui.sendFileDatachannel - ERROR ", e);
	}	   
}


//===================================
// PROCESS DOCUMENT ELEMENTS
//===================================
$(document).ready(function() {

	// PROPERTIES
	//-------------
	// GUI Elements
	var local = document.getElementById('localVideo');
	var remote = document.getElementById('remoteVideo');

	
	var fileList;

	// Connections
	var selectUser;
	var sessionRTC = new SessionRTC(); 
	var wschannel = new WsChannel();
	wschannel.init(sessionRTC);
	sessionRTC.init(wschannel, local, remote);
	
	// ACTIONS
	//--------------------------
	
	// 1.- Chat Event Listener
	$('#peers').change(function() {
		selectUser=setPeer(wschannel.socket);
		wschannel.selected=selectUser;
	});
  	$('#send-message').focus();
  	$('#send-form').submit(function(event) {
  		processSubmit(wschannel, event, selectUser);
  		return false;
  	}); 
  	
  	// 2.- Conversation Event Listener
  	$('#video').click(function(event) {
  		wschannel.conversationInvite(selectUser);
		return false;
  	}); 	
  	
    // 3.- Datachannel... chat
    $('#send-datachannel').click(function(event) {    
    	if(sessionRTC!=null) {
    		var message=$('#private-message').val();
    		$('#private-message').val('');
    		console.log("private message",  message);
    		sessionRTC.sendDatachannel(message);
    		
    	}  	
    });
    
    // 4.- Datachannel... file
    $('#file-datachannel').click(function(event) {    
    	if(sessionRTC!=null) {    		
    		sendFileDatachannel(sessionRTC, fileList, event) 
    		
    	}  	
    }); 
    
    
    // 5.- UI.. File management.
    $('#files-datachannel').change(function(event) {    
    		fileList=onFileSelect(event);
    		console.log("File Select:", fileList);
    }); 
    
    
    
    //var dropZone = document.getElementById('drop_zone');
    //var selectedFiles= document.getElementById('files-datachannel');
    
    //dropZone.addEventListener('dragover', onDragOver, false);
    //dropZone.addEventListener('drop', onDropFileSelect, false);
    //selectedFiles.addEventListener('change', onFileSelect, false);



});

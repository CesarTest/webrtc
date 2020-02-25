var WsChannel = function(logger) {

	//***********************************************************
	//*                     PROPERTIES
	//**********************************************************/
 	// 1.- Pointer to this process
	self=this;

	// 2.- Public Properties
	self.sessionRTC;
 	self.users;
	self.selected;

 	// 3.- Private Properties
 	/*var traza;
	if(typeof logger != 'undefined') {traza=logger;}
	else {traza=new Trazador();}
 	*/

	//***********************************************************
	//*                        TOOLS
	//**********************************************************/

	//------------------------------------------------
	//			      ADD DISPLAY USERS
	//------------------------------------------------
	//------------------------------------------------
    WsChannel.prototype.addDisplayUsers = function addDisplayUsers(element, item) {

		try {
	     	$(element).append($('<option>', item));

    	} catch(e) {
    		console.log(e);
    	}
    };

	//------------------------------------------------
	//			      REFRESH LIST
	//------------------------------------------------
	//------------------------------------------------
    WsChannel.prototype.refreshList = function refreshList(element, list) {

		//------------ LOCAL ENVIRONMENT -------------
        var key = '';
		var item;
		var highlight=false;
		var attributes;
		let i=1;


		// ----------------- ACTIONS ----------------
		try {
			//console.log("wschannel.refreshList() - Element:" + element + " selected=", self.selected);
			$(element).empty();
			for (key in list) {
				if(self.selected!=null) {highlight=(list[key].id==self.selected.end_id);}
				if (highlight) {
					item={
						 'value' : list[key].id
						, 'text' : list[key].name
						, 'selected' : 'selected'
					}
				} else {
					item={
						 'value' : list[key].id
						, 'text' : list[key].name
					}
				}

				self.addDisplayUsers(element,item);
				i++;
		    }

    	} catch(e) {
    		console.log(e);
    	}
    };

	//------------------------------------------------
	//			    PHONE CALL DIALOG
	//------------------------------------------------
	//------------------------------------------------
    function phoneCallDialog(p2p) {

		var text;

		// ----------------- ACTIONS ----------------
    	try {

			text="Do you accept a videoconference with " + p2p.end_name;

    		$( "#dialog-confirm" ).dialog({
    		  resizable: false,
    		  height: "auto",
    		  width: 400,
    		  modal: true,
    		  buttons: {
    		    "Accept": function() {
    		    	$( this ).dialog( "close" );
    		    	p2p.result="success";
   			   		self.sessionRTC.start(p2p, true);
				   	self.socket.emit('room-conversation-result',JSON.stringify(p2p));
    		    },
    		    Deny: function() {
    		    	$( this ).dialog( "close" );
    		    	p2p.result="reject";
    		    	self.socket.emit('room-conversation-result',JSON.stringify(p2p));
    		    }
    		  }
    		});

    	} catch(e) {
    		console.log(e);
    	}
    };

 	//***********************************************************
	//*                  EVENTS EMITTED
	//**********************************************************/

	//------------------------------------------------
	//			      PROCESS COMMAND
	//------------------------------------------------
	//------------------------------------------------
	WsChannel.prototype.processCommand = function(command) {

		//------------ LOCAL ENVIRONMENT -------------
		var words, command, message, room, name;

		// ----------------- ACTIONS ----------------
		try {

			// 1.- Treat Input Parameters
			//---------------------------
			words = command.split(' ');
			command = words[0].substring(1, words[0].length).toLowerCase()
			message = false;

			// 2.- Process Command
			//---------------------------
	 		switch(command) {

				 case 'join':
					words.shift();
					room = words.join(' ');
					self.socket.emit('room-join', JSON.stringify({ newRoom: room }));
					break;

				 case 'nick':
					words.shift();
					name = words.join(' ');
					self.socket.emit('room-nameAttempt', JSON.stringify(name));
					break;

				 default:
					 message = 'Unrecognized command.';
					 break;
			 }
			 return message;

		} catch (e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			      SEND MESSAGE
	//------------------------------------------------
	//------------------------------------------------
	WsChannel.prototype.sendMessage = function(room, text, p2p, type) {

		//------------ LOCAL ENVIRONMENT -------------
		var message;
		var tipo='txt';
		var text_tmp;

		// ----------------- ACTIONS ----------------
		try {

			// 1.- Local Properties
			//--------------------
			if(typeof type != 'undefined') {tipo=type;}
			console.log('wschannel.sendMessage() - text', text);
			console.log('wschannel.sendMessage() - room', room);
			console.log('wschannel.sendMessage() - p2p', p2p);
			console.log('wschannel.sendMessage() - type', type);


			// 2.- Build Message
			//--------------------
			switch (tipo) {
				case 'sdp':
					message = text;
					break;

				case 'ice':
					message = text;
					break;

				default:
					message = {
					      'room': room
					    , 'text': text
					};
					break;
			}

			// 2.- Log Properties
			//--------------------
			var  date = new Date();
			var  timestamp = date.getTime();
			console.log(timestamp + '... wschannel.sendMessage() - message', message);

			// 3.- Send Message
			//--------------------
			self.socket.emit('room-message', JSON.stringify(message), JSON.stringify(p2p));

		} catch (e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			   OPEN SESSION REQUEST
	//------------------------------------------------
	//------------------------------------------------
	WsChannel.prototype.conversationInvite = function(p2p) {
		try {


			// 0.- Log entry
			//--------------
			console.log("wschannel.conversationInvite() - Incoming Call Dialog");
			if (p2p!=null) {
				console.log(p2p);
				self.socket.emit('room-conversation-request', JSON.stringify(p2p));
			} else {
				alert("No user selected");
			}

		} catch (e) {
			console.log(e);
		}
	};

	//***********************************************************
	//*                  EVENTS RECIEVED
	//**********************************************************/

	//------------------------------------------------
	//			      START BEACON
	//------------------------------------------------
	//------------------------------------------------
    WsChannel.prototype.startBeacon = function startBeacon() {
    	try {
	        setInterval(function() {self.socket.emit('rooms');}, 1000 );
    	} catch(e) {
    		console.log(e);
    	}
     };

	//------------------------------------------------
	//			      ON ROOM USERS
	//------------------------------------------------
	//------------------------------------------------
	WsChannel.prototype.onRoomUsers = function (list,rooms) {

		// ----------------- ACTIONS ----------------
		try {

			//console.log("wschannel.onRoomUsers() - Users", list);
			//console.log("wschannel.onRoomUsers() - Rooms", rooms);
			self.refreshList("#peers",list);
			self.refreshList("#rooms",rooms);

		} catch (e) {
			  console.log(e);
		}
	};

	//------------------------------------------------
	//			         ON ROOMS
	//------------------------------------------------
	//------------------------------------------------
	WsChannel.prototype.onRooms =	function onRooms() {
		 try {
		 	$('#room-list').empty();
			for(var room in rooms) {
			  room = room.substring(1, room.length);
			  if (room != '') {
			    $('#room-list').append(divEscapedContentElement(room));
			  }
			}

		 } catch (e) {
			  console.log(e);
		 }
	};

	//------------------------------------------------
	//			    ON NAME RESULTS
	//------------------------------------------------
	//------------------------------------------------
	WsChannel.prototype.onNameResult =	function onNameResult(result) {
		   var message;
		   try {
			   console.log("wschannel.onNameResult()... Current User:", result);
			   if (result.success) {
			      message = 'You are now known as ' + result.name + '.';
			    } else {
			      message = result.message;
			    }

			    $('#messages').append(divSystemContentElement(message));

			} catch (e) {
				console.log ("ERROR configuring the channel");
				console.log(e);
			}
	};

	//------------------------------------------------
	//			       ON MESSAGE
	//------------------------------------------------
	//------------------------------------------------
	WsChannel.prototype.onMessage =	function onMessage(message) {

		//------------ LOCAL ENVIRONMENT -------------
		var newElement;
		var type='txt';
		var msj;

		// ----------------- ACTIONS ----------------
		try {
			console.log('wschannel.onMessage() - Message: ', message);

			if(message.hasOwnProperty('sdp')) {type='sdp';}
			if(message.hasOwnProperty('candidate')) {type='ice';}

			switch (type) {

			 	// Due to the coupling, it is not possible failure recovery
			  	// Those events should be allocated in a special channel (WsChannel), not in the room.
			 	case 'sdp':
				  	newElement = $('<div></div>').text(JSON.stringify(message));
				  	$('#messages').append(newElement);
				  	self.sessionRTC.processSdp(message);
				  	break;

			  	case 'ice':
				  	newElement = $('<div></div>').text(JSON.stringify(message));
				  	$('#messages').append(newElement);
			  		self.sessionRTC.processIce(message);
			  		break;

			  	default:
				  	var newElement = $('<div></div>').text(message.name + ":" + message.text);
				  	$('#messages').append(newElement);
			  		break;
			  }


		  } catch (e) {
			  console.log(e);
		  }
	 };

	//------------------------------------------------
	//			      ON JOIN RESULT
	//------------------------------------------------
	//------------------------------------------------
	WsChannel.prototype.onJoinResult =	function (result) {
		var item;

		try {
			 console.log("wschannel.onJoinResult()... Join properties:", result);
			 $('#room').text(result.room);
			 $('#messages').append(divSystemContentElement('Room changed.'));

			item={
		    		 value : result.room
		    		, text : result.room
		    }
			self.addDisplayUsers("#rooms",item,'1');

		} catch (e) {
			  console.log(e);
		}
	};

	//------------------------------------------------
	//			   ON CONVERSATION REQUEST
	//------------------------------------------------
	//------------------------------------------------
	WsChannel.prototype.onConversationRequest = function(p2p) {
		try {
			console.log("Conversation Invite to =", p2p);
			phoneCallDialog(p2p);
		} catch (e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			   ON CONVERSATION ACCEPTED
	//------------------------------------------------
	//------------------------------------------------
	WsChannel.prototype.onConversationAccepted = function(p2p) {
		try {
			if (p2p.result=="success") {self.sessionRTC.start(p2p, false);}
		} catch (e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			    SET STATE MACHINE
	//------------------------------------------------
	//------------------------------------------------
	WsChannel.prototype.setStateMachine = function setStateMachine() {
		try {

			// 1.- Room Events
			//--------------------
			//self.socket.on('join', function(room)               { self.onJoin(socket, room); });
			self.socket.on('room-message', function(message)           { self.onMessage(JSON.parse(message));   });
			self.socket.on('room-rooms', function(room)                { self.onRooms(JSON.parse(room));        });
			self.socket.on('room-joinResult', function(result)         { self.onJoinResult(JSON.parse(result)); });
			self.socket.on('room-nameResult', function(result)         { self.onNameResult(JSON.parse(result)); });
			self.socket.on('room-users', function(list,rooms)     	   { self.onRoomUsers(JSON.parse(list),JSON.parse(rooms)); });

			// 2.-Conversation Events
			//------------------------
			self.socket.on('room-conversation-request',  function(p2p)  { self.onConversationRequest(JSON.parse(p2p)); });
			self.socket.on('room-conversation-accepted', function(p2p)  { self.onConversationAccepted(JSON.parse(p2p)); });

		} catch (e) {
			console.log ("ERROR configuring the channel");
			console.log(e);
		}
	};

	/**************************************************
	*<!--                 INIT
	*===============================================-->
	*   Create a Web Socket Channel.
	*
	* @see    ui
	**************************************************/
	WsChannel.prototype.init = function init (session) {
		try {

			// 4.- Run current object... open Channel (that should be the last step, must be investigated).
			self.socket = io({transports: ['websocket'], upgrade: false}).connect();

			// 1.- Profile of properties of this object
			self.sessionRTC=session;

			// 2.- State's Machine
			self.setStateMachine();

		} catch (e) {
			console.log(e);
		}
	};

};

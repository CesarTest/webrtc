/************************************************************
 *<!--	              WEB SOCKET CHANNEL.JS 
 *========================================================--> 
 *  Events handler for the web socket channel
 *      
 *<!--====================================================-->
 *   @date      28/11/2016                   
 *   @author  	Cesar Delgado Gonzalez
 ************************************************************/

//**********************************************************
//  GLOBAL ENVIRONMENT
//**********************************************************
/*
* Module dependencies... 
*     Each module is an object within the server awaiting for runtime requests.
*     Just one object per module, whatever the number of clients (Node.js projects running on the server).
*/
try {
	var Trazador =  require('../../../utils/trazador');
	var Conversation = require('../conversation');
	var socketio = require('socket.io')
	, guestNumber = 1
	, nickNames = {}
	, namesUsed = []
	, currentRoom = {};
	
} catch (e) {
	
	// Logging System still not working, console printing	
	console.log("[application.signalling.wschannel.main()] - FATAL: Not able to load modules. Exiting.");
	console.error("[application.signalling.wschannel.main()] - FATAL: Not able to load modules. Exiting.");
	console.error(e.stack);
	process.exit(0);
}

//**********************************************************
// 					PRIVATE PROPERTIES
//**********************************************************
var io;
var traza;
var conversation;
var self=this;

//***********************************************************
//*                   PRIVATE METHODS
//**********************************************************/

//------------------------------------------------
//				SET LOGGER
//			private setLogger() 
//------------------------------------------------               
//			Pointer to logger
//------------------------------------------------
function setLogger(logger) {
	try {
		if(typeof logger != 'undefined') {
			traza=logger;
		} else {
			if (traza==null) { traza=new Trazador();}
		}
	} catch (e) {
		console.log("[application.signalling.wschannel.setLogger()] - WARN: Unable to setup logger. Unknow Condition.");	  
		throw e;
	}	
};


//------------------------------------------------
//			ASSIGN GUEST NAME
//		private assignGuestName() 
//------------------------------------------------               
//		Event: Assign Guest Name
//------------------------------------------------
function assignGuestName(socket, guestNumber, nickNames, namesUsed) {
	
	//------------ LOCAL ENVIRONMENT -------------		
	var name = 'Guest';
	
	// ----------------- ACTIONS ----------------	
	try {
		
		// 1.- Generate new guest name
		//----------------------------
		name = name + guestNumber;
		
		// 2.- Associate guest name with client connection ID Let user know their guest name
		//----------------------------
		nickNames[socket.id] = name;
		
		// 3.- Let user know their guest name
		//----------------------------		
		socket.emit('nameResult', {
			success: true,
			name: name
		});
		
		// 4.- Note that guest name is now used
		//----------------------------			
		namesUsed.push(name);
		
		// 5.- Increment counter used to generate guest names
		//----------------------------		
		return guestNumber + 1;
  
	} catch (e) {
		traza.print (Trazador.ERROR, "application.signalling.wschannel.assignGuestName()", 
			"EVENT: Nickname assignation failed. Please check machine's state and stack trace for more details.");
		traza.error(Trazador.ERROR, e);
	}  
}

//------------------------------------------------
//			HANDLE NAME CHANGE ATTEMPTS
//		private handleNameChangeAttemps() 
//------------------------------------------------               
//	Event: nickname change trials
//------------------------------------------------
function handleNameChangeAttempts(socket, nickNames, namesUsed) {

	//------------ LOCAL ENVIRONMENT -------------		
	var previousName;
	
	// ----------------- ACTIONS ----------------		
	try {	
	
		// Added listener for nameAttempt events
		socket.on('nameAttempt', function(name) {
		
			// 1.- If Nickname start with "Guest" (not allowed)... you ask user to change
			//------------------------------------
			if (name.indexOf('Guest') == 0) {
				socket.emit('nameResult', {
					success: false,
					message: 'Names cannot begin with "Guest".'
				});
			
			// 2.- Otherwise
			//------------------------------------					
			} else {

				// 2.1.- Nickname not already register
				if (namesUsed.indexOf(name) == -1) {
					
					// 2.1.1.- Remove previous Nickname from the pool						
					previousName = nickNames[socket.id];
					namesUsed.push(name);
					nickNames[socket.id] = name;
					socket.emit('nameResult', {
						success: true,
						name: name
					});
	
					// 2.1.2.- Announce  the new Nickname						
					socket.broadcast.to(currentRoom[socket.id]).emit('message', {
						text: previousName + ' is now known as ' + name + '.'
					});
				
				// 2.2.- Nickname already register
				} else {
					socket.emit('nameResult', {
						success: false,
						message: 'That name is already in use.'
					});
				}
			}
		});
		
	} catch (e) {
		traza.print (Trazador.ERROR, "application.signalling.wschannel.handleNameChangeAttemps()", 
				"EVENT: Update Nickname failed. Please check machine's state and stack trace for more details.");
		traza.error(Trazador.ERROR, e);
	}			
}

//------------------------------------------------
//			HANDLE MESSAGE BROADCASTING
//		private handleMessageBroadcasting() 
//------------------------------------------------               
//		Event: Handle chat messages
//------------------------------------------------
function handleMessageBroadcasting(socket, nickNames) {
	try {	
		socket.on('message', function (message) {
			socket.broadcast.to(message.room).emit('message', {
				text: nickNames[socket.id] + ': ' + message.text
			});
		});
		
	} catch (e) {
		traza.print (Trazador.ERROR, "application.signalling.wschannel.handleMessageBroadcasting()", 
				"EVENT: Sending chat message. Please check machine's state and stack trace for more details.");
		traza.error("3", e);
	}	
}

//------------------------------------------------
//				HANDLE ROOM JOINIG
//			private handleRoomJoining() 
//------------------------------------------------               
//		Event: Joining a room.
//------------------------------------------------
function handleRoomJoining(socket) {
	try {	
		socket.on('join', function(room) {
			socket.leave(currentRoom[socket.id]);
			socket.join(room.newRoom);
			currentRoom[socket.id] = room.newRoom;
			socket.emit('joinResult', {room: room.newRoom});
		});
		
	} catch (e) {
		traza.print (Trazador.ERROR, "application.signalling.wschannel.handleRoomJoining()", 
				"EVENT: Joining Room. Please check machine's state and stack trace for more details.");
		traza.error("3", e);
	}		
}

//------------------------------------------------
//			HANDLE CLIENT DISCONNETION
//		private handleClientDisconnection() 
//------------------------------------------------               
//Event: Client disconnection.
//------------------------------------------------
function handleClientDisconnection(socket, nickNames, namesUsed) {
	try {		
		socket.on('disconnect', function() {
			var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
			delete namesUsed[nameIndex];
			delete nickNames[socket.id];
		});
	} catch (e) {
		traza.print (Trazador.ERROR, "application.signalling.wschannel.handleClientDisconnection()", 
				"EVENT: Disconnecting User. Please check machine's state and stack trace for more details.");
		traza.error("3", e);
	}		
}

//------------------------------------------------
//			CONFIGURE CONNECTION
//		private configureConnection() 
//------------------------------------------------               
//    Define events, the states machine of 
// the connection.
//------------------------------------------------
function configureChannel() {
	try { 	

		// 0.- Log the configuration profile
		//-------------
		traza.print (Trazador.DEBUG, "application.signalling.conversation.wschannel.configureChannel()", "WSCHANNEL - Dumping configuration profile for the channel");			
		
		// 1.- Setting up the channel
		//-------------		
		io.sockets.on('connection', function (socket) {
			
			// 1.- Default Chat Room
			socket.join('Lobby');
		
			// 2.- Place user in the "Lobby" room when they connect
			currentRoom[socket.id] = 'Lobby';
			socket.emit('joinResult', {room: 'Lobby'});
		
			// 3.- Assign user a guest name when they connect
			guestNumber = assignGuestName(
					socket,
					guestNumber,
					nickNames,
					namesUsed );
		
			// 4.- Handle user messages, name change attempts, and room creation/changes.
			handleMessageBroadcasting(socket, nickNames);
			handleNameChangeAttempts(socket, nickNames, namesUsed);
			handleRoomJoining(socket);
		
			// 5.- Provide user with a list of occupied rooms on request.
			//socket.on('rooms', function() {
			//	socket.emit('rooms', io.sockets.adapter.rooms);
			//});
		
			// 6.- Define "cleanup" logic for when a user disconnects
			handleClientDisconnection(socket, nickNames, namesUsed);
		});		
		
		
	} catch (e) {
		traza.print (Trazador.ERROR, "application.signalling.wschannel.configureConnection()", "Setup events of the conversation.");
		traza.error(Trazador.ERROR, e);
	}	
}


//***********************************************************
//*                   PUBLIC METHODS
//**********************************************************/


/**************************************************
*<!--             SET CONVERSATION
*===============================================-->
*   Bind Session to a Conversation. 
*
* @param  {inputConversation} Conversation to bind
* @see    application.signalling.conversation
**************************************************/ 
WsChannel.prototype.setConversation= function(inputConversation) {
	try {
		if(typeof inputConversation != 'undefined') {
			conversation=inputConversation; 
		} else {
			traza.print (Trazador.WARN, "application.signalling.conversation.wschannel.setConversation()", "Missing Input Argument.... inputConversation:[" + typeof inputConversation +"]");			
			traza.print (Trazador.WARN, "application.signalling.conversation.wschannel.setConversation()", "Error linking current Channel to a Conversation.");			
		}
		
	} catch (e) {
		traza.print (Trazador.ERROR, "application.signalling.conversation.wschannel.setConversation()", "Error linking current Channel to a Conversation. Unknown condition");
		traza.print (Trazador.ERROR, "application.signalling.conversation.wschannel.setConversation()", ".... inputConversation:[" + typeof inputConversation + "]");			
		traza.error(Trazador.ERROR, e);		
	}	
};

/**************************************************
*<!--                 CONFIGURE
*===============================================-->
*   Create a Web Socket Channel.
*   
* @param  server HTTP server object for piggyback attachment
* @see    listener.server
**************************************************/ 
WsChannel.prototype.configure = function(statelessChannel) {
	try { 
		
		// Start Listening
		traza.print (Trazador.INFO, "application.signalling.conversation.wschannel.configure()", "WSCHANNEL... socketio.listen() at port=[" + typeof statelessChannel +"]");			
		io = socketio.listen(statelessChannel);
		io.set('log level', 1);
		
		// Configure Channel
		configureChannel();
		
	} catch (e) {
		traza.print (Trazador.ERROR, "application.signalling.conversation.wschannel.configure()", "Configuring the WebSocket Channel.");
		traza.error(Trazador.ERROR, e);
	}		 
};


//***********************************************************
//*                       CONSTRUCTOR
//**********************************************************/

/**************************************************
*<!--             WS CHANNEL
*===============================================-->
*   WebSocket Channel. 
*   Package: application.signalling
*
* @constructor  
* @param  logger Pointer to logger
* @see    application.signalling
**************************************************/ 
function WsChannel(logger) {

	// 1.- Create new Object if already not launched
	if (!(this instanceof WsChannel)) {
	  return new WsChannel(logger);
	}
	
	// 2.- Point to logger
	setLogger(logger);
	
};
module.exports = WsChannel;

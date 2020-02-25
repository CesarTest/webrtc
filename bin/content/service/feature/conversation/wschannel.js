"use strict"
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

	// Custom Libraries
	var Trazador =  require('../../../../utils/trazador');
	var Conversation = require('../conversation');

	// Communication Libraries
	var socketio = require('socket.io');

} catch (e) {

	// Logging System still not working, console printing
	console.log("[content.service.conversation.wschannel.main()] - FATAL: Not able to load modules. Exiting.");
	console.error("[content.service.conversation.wschannel.main()] - FATAL: Not able to load modules. Exiting.");
	console.error(e.stack);
	process.exit(0);
}

//***********************************************************
//*                  DEFAULT VALUES
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


	//**********************************************************
	//	PRIVATE PROPERTIES
	//**********************************************************
	// Self Pointer
	var self=this;

	// Logger pointer
	var traza;
	if(typeof logger != 'undefined') {self.traza=logger;}
	else {self.traza=new Trazador();}

	// Conversation observer
	var conversation;

	// WebSocket
	var io;
	var socket;

	// Room
	self.guestNumber = 1;
	self.rooms=[]; // room name = list of users {socket.id}
	self.users=[];  // user = socket.id, guest name
	self.signallingChannel;

	//**********************************************************
	// 					GETTER - SETTER
	//**********************************************************

	/**************************************************
	*<!--             SET CONVERSATION
	*===============================================-->
	*   Bind Session to a Conversation.
	*
	* @param  {inputConversation} Conversation to bind
	* @see    application.signalling.conversation
	**************************************************/
	WsChannel.prototype.setConversation= function setConversation (inputConversation, that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {
			if(typeof inputConversation != 'undefined') {
				self.conversation=inputConversation;
			} else {
				self.traza.print (self.traza.WARN, "content.service.conversation.wschannel.setConversation()", "Missing Input Argument.... inputConversation:[" + typeof inputConversation +"]");
				self.traza.print (self.traza.WARN, "content.service.conversation.wschannel.setConversation()", "Error linking current Channel to a Conversation.");
			}

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.setConversation()", "Error linking current Channel to a Conversation. Unknown condition");
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.setConversation()", ".... inputConversation:[" + typeof inputConversation + "]");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	/**************************************************
	*<!--             SET SOCKET POOL
	*===============================================-->
	*   Set Pool of Web Sockets.
	*
	* @param  {pool} Socket to use
	* @see    service.signalling.conversation
	**************************************************/
	WsChannel.prototype.setSocketPool= function setSocketPool (pool, that) {


		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {
			self.traza.print (self.traza.DEBUG, "content.service.conversation.wschannel.setSocketPool()", "Missing Input Argument.... pool:[" + typeof pool +"]");

			if(typeof pool != 'undefined') {
				self.io=pool[0];
			} else {
				self.traza.print (self.traza.WARN, "content.service.conversation.wschannel.setSocketPool()", "Missing Input Argument.... pool:[" + typeof pool +"]");
				self.traza.print (self.traza.WARN, "content.service.conversation.wschannel.setSocketPool()", "Error linking current Web Socket Pool to a Conversation.");
			}

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.setSocketPool()", "Error linking current Web Socket Pool to a Conversation. Unknown condition");
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.setSocketPool()", ".... pool:[" + typeof pool + "]");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	/**************************************************
	*<!--           GET USERS OF ROOM
	*===============================================-->
	*   Extract user .
	**************************************************/
	WsChannel.prototype.getUsersOfRoom= function getUsersOfRoom (socket, that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}
		var sala='Lobby';
		var result=[];
		var indice, usuario;
		// ----------------- ACTIONS ----------------
		try {

			for (indice in self.users) {
				usuario=self.users[indice];
				if (usuario.room==sala) {result.push(usuario);}
			}
			self.traza.print (self.traza.TRACE, "content.service.conversation.wschannel.getUsersOfRoom()", self.users);
			return result;

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.getUsersOfRoom()", result);
			self.traza.error(self.traza.ERROR, e);
		}
	};

	/**************************************************
	*<!--             ASSIGN USER
	*===============================================-->
	*   Extract user .
	**************************************************/
	WsChannel.prototype.assingUserToRoom= function assingUserToRoom (id,nick,sala,that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}
		var usuario=[];
		var salaTmp=[];

		// ----------------- ACTIONS ----------------
		try {
			// 1.- Properties
			//------------------
			usuario={
				  id   : id
				, name : nick
				, room : sala
			}

			salaTmp={
				     id   : sala
				   , name : sala
				  }

			// 2.- User
			//------------------
			if (typeof self.users == 'undefined') {self.users=[];}
			self.users[id] = usuario;

			// 3.- Room
			//------------------
			if (typeof self.rooms[sala]== 'undefined') { self.rooms=[]; }
			self.rooms[sala] = salaTmp;

			self.traza.printObject (self.traza.DEBUG, "content.service.conversation.wschannel.assingUserToRoom()", self.users);


		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.assingUserToRoom()", " id=["+ id  + "] Room=[" + sala + "] user=[" + nick + "]");
			self.traza.error(self.traza.ERROR, e);
		}
	};


	/**************************************************
	*<!--             GET INDEX
	*===============================================-->
	*   Extract user .
	**************************************************/
	WsChannel.prototype.getIndex= function getIndex(array,that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}
		var lista=[];
		var indice;

		// ----------------- ACTIONS ----------------
		try {

			if (typeof array != 'undefined') {
				for (indice in array) {
					lista.push(indice);
				}
			}
			self.traza.printObject (self.traza.TRACE, "content.service.conversation.wschannel.getIndex()", lista);
			return lista;
		} catch (e) {
			self.traza.printObject (self.traza.ERROR, "content.service.conversation.wschannel.getIndex()", array);
			self.traza.error(self.traza.ERROR, e);
		}
	};

	/**************************************************
	*<!--             GET VALUE
	*===============================================-->
	*   Extract user .
	**************************************************/
	WsChannel.prototype.getValue= function getValue(array, that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}
		var lista=[];
		var indice=0;

		// ----------------- ACTIONS ----------------
		try {

			if (typeof array != 'undefined') {
				for (indice in array) {
					lista.push(array[indice]);
				}
			}
			self.traza.printObject (self.traza.TRACE, "content.service.conversation.wschannel.getValue()", lista);
			return lista;
		} catch (e) {
			self.traza.printObject (self.traza.ERROR, "content.service.conversation.wschannel.getIndex()", array);
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//***********************************************************
	//*                   PRIVATE METHODS
	//**********************************************************/

	//------------------------------------------------
	//				    BEACON
	//			  private beacon()
	//------------------------------------------------
	//			Event: Assign Guest Name
	//------------------------------------------------
	WsChannel.prototype.startBeacon= function startBeacon(socket, that) {


		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {
			setInterval(function() {

				var salas;
				var nicks;

				// 1.- Prepare list of users and rooms
				//------------------------------
				if (typeof self.rooms != "undefined") {salas=self.getValue(self.rooms);}
				if (typeof self.users != "undefined") {nicks=self.getUsersOfRoom(socket);}

				// 2.- Set Beacon
				//------------------------------
				socket.broadcast.emit('room-users', JSON.stringify(nicks), JSON.stringify(salas));

				// 3.- Log Result
				//------------------------------
				self.traza.printObject (self.traza.TRACE, "content.service.conversation.wschannel.startBeacon()", nicks,
				"EVENT: Beacon. Users of current room=");
				self.traza.printObject (self.traza.TRACE, "content.service.conversation.wschannel.startBeacon()", salas,
				"EVENT: Beacon. Rooms=");

		    }, 10000);


		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.startBeacon()",
				"EVENT: Beacon events.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//				ON_NAME_ATTEMPT
	//			 private onNameAttemp()
	//------------------------------------------------
	//		Event: nickname change trials
	//------------------------------------------------
	WsChannel.prototype.onNameAttempt=function onNameAttempt(socket, name, that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}
		var previousName;

		// ----------------- ACTIONS ----------------
		try {

			// 0.- Log Entry
			//--------------
			self.traza.print (self.traza.TRACE, "content.service.conversation.wschannel.onNameAttempt()", "EVENT: NameAttemp.");
			self.traza.printObject (self.traza.TRACE, "socket.id=[" + socket.id + "] - Event:'nameAttempt'", name);

			// 1.- If Nickname start with "Guest" (not allowed)... you ask user to change
			//------------------------------------
			if (name.indexOf('Guest') == 0) {

				socket.emit('room-nameResult', JSON.stringify({
					  success: false
					, message: 'Names cannot begin with "Guest".'
				}));

			// 2.- Otherwise
			//------------------------------------
			} else {

				// 2.1.- Nickname not already register
				//if (namesUsed.indexOf(name) == -1) {

					// 2.1.1.- Remove previous Nickname from the pool
					previousName = self.users[socket.id];
					self.users[socket.id].name = name;
					socket.emit('room-nameResult', JSON.stringify({
						success: true,
						name: name
					}));

					// 2.1.2.- Announce  the new Nickname
					socket.broadcast.to(self.users[socket.id].room).emit('room-message', JSON.stringify({
						text: previousName + ' is now known as ' + name + '.'
					}));

				// 2.2.- Nickname already register
				/*} else {
					socket.emit('room-nameResult', JSON.stringify({
						success: false,
						message: 'That name is already in use.'
					}));
				}*/
			}

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.onNameAttempt()",
					"EVENT: Update Nickname failed. Please check machine's state and stack trace for more details.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//				      ON_MESSAGE
	//			     private onMessage()
	//------------------------------------------------
	//			    Event: Message
	//------------------------------------------------
	WsChannel.prototype.onMessage = function onMessage(socket, message, p2p, that) {


		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}
		var msj='';
		var peer;
		var name;
		var filter='relay';

		// ----------------- ACTIONS ----------------
		try {

			// 1.- Room Message
			//--------------------
			if ((typeof p2p == "undefined")|| p2p==null ) {


				// 1.- Properties
				msj=message;
				msj.name=self.users[socket.id].name;

				// 2.- Log Entry
				self.traza.printObject (self.traza.TRACE, "socket.id=[" + socket.id + "] - Event:'message'", msj, "message=");

				// 3.- Broadcast
				socket.broadcast.to(message.room).emit('room-message', JSON.stringify(msj));


			// 2.- Private Message
			//--------------------
			} else {

				// 2.1.- Detect end user
				switch (socket.id) {
					case p2p.start_id:
						peer=p2p.end_id;
						name=p2p.end_name;
						break;
					case p2p.end_id:
						peer=p2p.start_id;
						name=p2p.start_name;
						break;
				}

				// 2.2.- Build Message
				//msj.name=name;

				// 2.3.- Log Entry
				self.traza.printObject (self.traza.TRACE, "socket.id=[" + socket.id + "] - Event:'private message'", message, "message=");

				// 2.4.- On ICE messages, filter all except relay ones
				if(typeof message.candidate != 'undefined') {
					if(message.candidate.indexOf(filter) !== -1) {msj=message;}

					self.traza.printObject (self.traza.TRACE, "socket.id=[" + socket.id + "] - Event:'private message'... ICE after filters", msj, "msj=");
				} else { msj=message; }


				// 2.5.- Pass Private Message to other peer
				socket.broadcast.to(peer).emit('room-message', JSON.stringify(msj));
			}

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.onMessage()",
					"EVENT: Sending chat message. Please check machine's state and stack trace for more details.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//			      ON_JOIN
	//		       private onJoin()
	//------------------------------------------------
	//	 Event: Joining a room
	//------------------------------------------------
	WsChannel.prototype.onJoin= function onJoin(socket, room, that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}
		var nick;
		var sala;
		var result;

		// ----------------- ACTIONS ----------------
		try {

			// 0.- Log Entry
			//--------------
			self.traza.printObject (self.traza.TRACE, "socket.id=[" + socket.id + "] - Event:'join'", room, ' ');

			// 1.- Capture Room and Nick
			//----------------
			sala=self.users[socket.id].room;
			nick=self.users[socket.id].name;

			// 2.- Exit from room
			//--------------
			socket.leave(self.users[socket.id].room);

			// 3.- Enter room
			//--------------
			sala=room.newRoom;
			self.users[socket.id].room=sala;
			socket.join(sala);

			// 4.- Communicate Result
			//------------------------
			result = {
				  room: self.users[socket.id].room
				, success : true
			}
			socket.emit('room-joinResult', JSON.stringify(result));

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.onJoin()",
					"EVENT: Joining Room. Please check machine's state and stack trace for more details.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//		     ON_CONVERSATION_REQUEST
	//		   private onConversationRequest()
	//------------------------------------------------
	//	 Event: Retransmit Request to other Peer.
	//------------------------------------------------
	WsChannel.prototype.onConversationRequest= function onConversationRequest(socket, p2p, that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}
		var message;

		// ----------------- ACTIONS ----------------
		try {

			// 0.- Log Entry
			//--------------
			self.traza.printObject (self.traza.TRACE, "content.service.conversation.wschannel.onConversationRequest() - Event:'conversation-request'", p2p, ' with end=');

			// 1.- Retransmit to other peer
			//-------------------
			if (p2p!=null) {

				if (p2p.start_id!=p2p.end_id) {
					p2p.start_name=self.users[socket.id].name;
					socket.broadcast.to(p2p.end_id).emit('room-conversation-request',JSON.stringify(p2p));
				} else {
					self.traza.print (self.traza.DEBUG, "content.service.conversation.wschannel.onConversationRequest()",
				       					"EVENT: Conversation Request... start=end points.");
				}
			}

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.onConversationRequest()",
					"EVENT: Conversation Request. Please check machine's state and stack trace for more details.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//		     ON_CONVERSATION_ANSWER
	//		   private onConversationAnswer()
	//------------------------------------------------
	//	 Event: Retransmit Request to other Peer.
	//------------------------------------------------
	WsChannel.prototype.onConversationAnswer= function onConversationAnswer(socket, p2p, that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}
		var message;

		// ----------------- ACTIONS ----------------
		try {

			// 0.- Log Entry
			//--------------
			self.traza.printObject (self.traza.TRACE, "start=[" + socket.id + "] - Event:'room-conversation-answer'", p2p, ' connection=');

			// 1.- Retransmit to other peer
			//-------------------
			if (p2p!=null) {

				if (p2p.start!=p2p.end) {
					socket.broadcast.to(p2p.start_id).emit('room-conversation-answer', JSON.stringify(p2p));
				} else {
					self.traza.print (self.traza.DEBUG, "content.service.conversation.wschannel.onConversationAnswer()",
				       					"EVENT: Conversation Answer... start=end points.");
				}
			}

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.onConversationAnswer()",
					"EVENT: Conversation Answer. Please check machine's state and stack trace for more details.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//		     ON_CONVERSATION_RESULT
	//		  private onConversationResult()
	//------------------------------------------------
	//	 Event: Retransmit Request to other Peer.
	//------------------------------------------------
	WsChannel.prototype.onConversationResult= function onConversationResult(socket, p2p, that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}
		var message;
		var end=true;

		// ----------------- ACTIONS ----------------
		try {

			// 0.- Log Entry
			//--------------
			self.traza.printObject (self.traza.TRACE, "start=[" + socket.id + "] - Event:'room-conversation-result'", p2p, ' with end=');

			// 1.- Start New Session RTC
			//-------------------
			switch(p2p.result) {
			    case 'success':
					socket.broadcast.to(p2p.end_id).emit('room-conversation-accepted', JSON.stringify(p2p));
					socket.broadcast.to(p2p.start_id).emit('room-conversation-accepted', JSON.stringify(p2p));
			        break;
			    default:
			    	break;
			}

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.onConversationResult()",
					"EVENT: Conversation Result. Please check machine's state and stack trace for more details.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//				    ON_DISCONNECT
	//			    private onDisconnect()
	//------------------------------------------------
	//          Event: Client disconnection.
	//------------------------------------------------
	WsChannel.prototype.onDisconnect=function onDisconnect(socket, that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {

			// 0.- Log Entry
			//--------------
			self.traza.print (self.traza.TRACE, "content.service.conversation.wschannel.onDisconnect()", "EVENT: Disconnect.");
			self.traza.printObject (self.traza.TRACE, "socket.id=[" + socket.id + "] - Event:'onDisconnect'");

			// 1.- Remove user from the array
			//--------------
			delete self.users[socket.id];

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.onDisconnect()",
					"EVENT: Disconnecting User. Please check machine's state and stack trace for more details.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//				   GET ROOM USERS
	//			   private onGetRoomUsers()
	//------------------------------------------------
	//			    Event: Get Room Users
	//------------------------------------------------
	WsChannel.prototype.onGetRoomUsers = function onGetRoomUsers(socket, room, that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}
		var list;
		var namespace=String("");

		// ----------------- ACTIONS ----------------
		try {
			1
			// 0.- Log Entry
			//--------------
			//traza.print (self.traza.DEBUG, "content.service.conversation.wschannel.onJoin()", "EVENT: Message from user=[" + self.io.sockets.manager.roomClients[socket.id]);
			self.traza.printObject (self.traza.TRACE, "socket.id=[" + socket.id + "] - Event:'get-room-users'",  room, "room=");

			// 1.- Actions
			//--------------
			//socket.emit('room-users', nicknames);

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.onGetRoomUsers()",
					"EVENT: Sending Users of the room. Please check machine's state and stack trace for more details.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//			       DEFINE EVENTS
	//			   private defineEvents()
	//------------------------------------------------
	//	    Define events, the states machine of
	// the connection.
	//------------------------------------------------
	WsChannel.prototype.defineEvents =	function defineEvents(socket, that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {

			self.traza.print (self.traza.INFO, "content.service.conversation.wschannel.defineEvents()", "Define Events of the Channel.");


			// 1.- Socket.IO standard events (Room)
			//------------------------------
			socket.on('disconnect', function()            { self.onDisconnect(socket, self); });
		/*
		 	socket.on('connect', function(room)           { self.onConnect(socket); });
			socket.on('connect_error', function(room)     { self.onConnectError(socket); });
			socket.on('connect_timeout', function(room)   { self.onConnectTimeout(socket); });
		  	socket.on('disconnect_error', function(room)  { self.onDisconnectError(socket); });
			socket.on('disconnect_timeout', function(room){ self.onDisconnectTimeout(socket); })
			socket.on('reconnecting', function(room)      { self.onReconnecting(socket); });
			socket.on('reconnect_error', function(room)   { self.onReconnectError(socket); });
			socket.on('reconnect_failed', function(room)  { self.onReconnectTimeout(socket); })
		*/

			// 2.- Chat events (Room)
			//------------------------

			socket.on('room-join', function(room)              { self.onJoin(socket, JSON.parse(room),self); });
		    socket.on('room-message', function(message, p2p)   { self.onMessage( socket,JSON.parse(message),JSON.parse(p2p), self); });
			socket.on('room-nameAttempt', function(name)       { self.onNameAttempt(socket, JSON.parse(name),self); });
			socket.on('room-get-room-users', function(room)    { self.onGetRoomUsers(socket, JSON.parse(room),self); });

			// 3.-  Conversation Events (Room)
			//------------------------------
			socket.on('room-conversation-request', function(p2p) { self.onConversationRequest(socket, JSON.parse(p2p),self);   });
			socket.on('room-conversation-answer', function(p2p)  { self.onConversationAnswer(socket, JSON.parse(p2p),self);    });
			socket.on('room-conversation-result', function(p2p)  { self.onConversationResult(socket, JSON.parse(p2p),self);    });

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.defineEvents()", "Define Events of the Channel.");
			self.traza.printObject (self.traza.TRACE, "content.service.conversation.wschannel.defineEvents()", socket, "Dumping Socket Object");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//			   SET INITIAL CONDITIONS
	//			private setInitialConditions()
	//------------------------------------------------
	//	 Initial Conditions of a conversation
	//------------------------------------------------
	WsChannel.prototype.setInitialConditions = function setInitialConditions(socket, that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}
		var nick;
		var sala;
		var result;


		// ----------------- ACTIONS ----------------
		try {

			// 0.- Log result
			sala='Lobby';
			self.traza.print (self.traza.TRACE, "content.service.conversation.wschannel.setInitialConditions()", "Join  socket=[" + socket.id + "] to room [" + sala + "]" );

			// 1.- Join the room
			socket.join(sala);

			// 2.- Initial name to user
			nick='Guest' + self.guestNumber;
			self.guestNumber=self.guestNumber+1;

			// 3.- Allocate user
			self.assingUserToRoom(socket.id, nick, sala);

			// 4.- Communicate Result
			result={
				  room: sala
				, name: nick
				, socket: socket.id
				, success : true
			}
			socket.emit('room-nameResult', JSON.stringify(result));
			socket.emit('room-joinResult', JSON.stringify(result));

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.setInitialConditions()", "Set initial conditions of the channel.");
			self.traza.printObject (self.traza.TRACE, "content.service.conversation.wschannel.setInitialConditions()", socket, "Dumping Socket Object");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//				SET STATE MACHINE
	//			private setStateMachine()
	//------------------------------------------------
	//	 Connection state's machine = socket state's machine
	//------------------------------------------------
	WsChannel.prototype.setStateMachine = function setStateMachine(that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {

			self.io.sockets.on('connection', function (socket) {

					// 0.- Log
					self.traza.print (self.traza.DEBUG, "content.service.conversation.wschannel.setStateMachine()",
						"Created a new socket=[" + socket.id + "], transport method=[" + socket.conn.transport.name + "]");

					// 1.- Define events of the socket
					self.setInitialConditions(socket,self);
					self.defineEvents(socket,self);
					self.startBeacon(socket,self);
			});

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.setStateMachine()", "Setup events of the channel.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//				SET PROPERTIES
	//			private setProperties()
	//------------------------------------------------
	//	    Define properties of the channel.
	//------------------------------------------------
	WsChannel.prototype.setProperties = function setProperties(that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {

			//WsChannel.io.configure('production', function(){

				// 0.- Logging
				//--------------
				self.traza.print (self.traza.TRACE, "content.service.conversation.wschannel.setProperties()", "Dump configuration profile for this channel.");

				// 1.- Socket.io transport options
				//-------------------------------
		        //WsChannel.io.enable('browser client minification');  // send minified client
		        //WsChannel.io.enable('browser client etag');          // apply etag caching logic based on version number
		        //WsChannel.io.enable('browser client gzip');          // gzip the file
		        self.io.set('log level', 3);                    // reduce logging
		        self.io.set('transports', [
		            'polling'
		          , 'websocket'
		          , 'flashsocket'
		          , 'xhr-polling'
		          , 'jsonp-polling'
		        ]);

		  //});

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.configureChannel()", "Setup events of the conversation.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//				   OPEN
	//			  private open()
	//------------------------------------------------
    //
	//------------------------------------------------
	WsChannel.prototype.bind = function create(statelessChannel, that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {
			self.traza.print (self.traza.INFO, "content.service.conversation.wschannel.bind()", "WSCHANNEL - Binding Channel to a server");
			//traza.printObject (self.traza.TRACE, "content.service.conversation.wschannel.bind()", statelessChannel, "Dump Server properties ");
			self.io =  socketio.listen(statelessChannel);

		} catch(e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.open()", "WSCHANNEL - Listening.");
			self.traza.error(self.traza.ERROR, e);
		}

	};

	//***********************************************************
	//*                   PUBLIC METHODS
	//**********************************************************/

	/**************************************************
	*<!--                 INIT
	*===============================================-->
	*   Create a Web Socket Channel.
	*
	* @param  server HTTP server object for piggyback attachment
	* @see    listener.server
	**************************************************/
	WsChannel.prototype.init = function init (that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {

			// 1.- State's Machine
			self.traza.print (self.traza.INFO, "content.service.conversation.wschannel.init()", "WSCHANNEL - Init - Configuring the WebSocket Channel.");


		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.init()", "Configuring the WebSocket Channel.");
			self.traza.error(self.traza.ERROR, e);
		}
	};


	/**************************************************
	*<!--                 INIT
	*===============================================-->
	*   Create a Web Socket Channel.
	*
	* @param  server HTTP server object for piggyback attachment
	* @see    listener.server
	**************************************************/
	WsChannel.prototype.start = function start (that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {

			// 1.- State's Machine
			self.setStateMachine(self);

		} catch (e) {
			self.traza.print (self.traza.ERROR, "content.service.conversation.wschannel.init()", "Configuring the WebSocket Channel.");
			self.traza.error(self.traza.ERROR, e);
		}
	};


};
module.exports = WsChannel;
"use strict"
//**********************************************************
//  PROTOTYPE ENVIRONMENT
//**********************************************************
/*
* Module dependencies... 
*     Each module is a prototype object within the server awaiting for runtime requests.
*     Objects created with 'new' command inherit all methods and properties of the prototype.     
*/
try {
	
	// POLICIES: 
	//   - Methods created inside constructor... to have access to self variable within methods.
	//   - Otherwise, it is much difficult to know exactly which environment I am using each time.
	//   - Therefore... prototypes can't be declared as 'const', I will create methods during first 'new' call.

	
		// Objects to be controlled
		var 
			 // Common to all objects
			  Trazador     =  require('../../utils/trazador')
			, Inheritance = require('util')			  
			, Events      = require('events')	

			// Specific to this object
			, io          = require('socket.io');
	
} catch (e) {
	
	// Logging System still not working, console printing	
	console.log("[communication.realtime.main()] - FATAL: Not able to load modules. Exiting.");
	console.error("[communication.realtime.main()] - FATAL: Not able to load modules. Exiting.");
	console.error(e.stack);
	process.exit(0);
}

/**
*<!--              CONNECTION
*===============================================-->
* <p><b> RESPONSABILITIES: </b>
* 
*  <table>
*  
*  	<!-- Responsability Header  --> 
*  	<tr><td colspan='2'>Create Resources: Queues and Exchanges. </td></tr>
*  	<tr> <td>EVENTS </td>  <td>ACTIONS </td></tr>
*  
*  	<!-- Responsability Contents --> 
*  	<tr>
*  		<td> None. </td>
*      	<td> None. </td> 
*  	</tr> 
*  
*  	<!-- Responsability Header  --> 
*  	<tr><td colspan='2'>Assign Resources. </td></tr>
*  	<tr> <td>EVENTS </td>  <td>ACTIONS </td></tr>
*  
*  	<!-- Responsability Contents --> 
*  	<tr>
*  		<td> None. </td>
*      	<td> None. </td> 
*  	</tr> 
*  </table>
*
* <p><b> INITIALIZATIONS: </b>
*	<ul>
*		<li><strong>Init:</strong> load properties.</li>
*		<li><strong>Start:</strong> create resources.</li>
* </ul>
* </p>
* 
*<!--====================================================--> 
* @constructor  
* @param  {logger} Pointer to system's logger object
* @see    communication.realtime
* @date   1/12/2016                   
* @author Cesar Delgado Gonzalez 
**************************************************/ 
function Connection(logger) {


	//**********************************************************
	//  PRIVATE PROPERTIES
	//**********************************************************
	// Self Pointer
	var self=this;	
	
	// Logger pointer
	if(typeof logger != 'undefined') {self.traza=logger;}
	else                             {self.traza=new Trazador();}
	// If not logger... then we should create one in the prototype space
	
	// Socket.io Pool pointer 
	self.socketPool; 
	
	// Console Channel
	self.realtime;
	
	// NOTE 1
	//  In JavaScript, still don't know how to achieve full encapsulation 
	//                without troubles accessing environment. Workaround:
	//   1.- self.pointer... to other objects that I need to interact with.
	//   2.- get/setPointer()... although public properties, handle as private ones.
	//   3.- logger pointer uses full encapsulation experimentally, but 'self.var' naming makes the reference much clear.
	
	// NOTE 2
	//   1.- Methods are public and allocated in prototype space to minimize memory usage in run-time
	//   2.- Private methods are hidden in the documentation, but they are actually public
	//       Prototype space only allow public methods to make environment access simpler.
	//              (it is not require to validate who and how  is accessing to this memory)
	//              therefore, as a workaround, we just hide those functions to the developer eyes in the JSDoc.

	//**********************************************************
	//  ACTIONS: Wait for Events
	//**********************************************************	
	 Events.EventEmitter.call(self); // Start Listener	
};


//***********************************************************
//*                   GETTER / SETTER
//*              getter/setter of properties 
//**********************************************************/	

/**
*<!--          GET REAL TIME 
*===============================================-->
* @return  Real Time Controller assign to this object
* @see     communication.realtime
**************************************************/ 
Connection.prototype.getRealtime = function getRealtime(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------			
	try { 
		return self.realtime;
	} catch (e) {
		self.traza.print (self.traza.ERROR, "communication.realtime.connection.getRealtime()", "Something misconfigure in the assignation.");
		self.traza.treatError(e);
	}		 
};

/**
*<!--            SET REAL TIME CONTROLLER
*===============================================-->
* @param  {inputController} Real Time Controller pointer
* @see    communication.realtime
**************************************************/ 
Connection.prototype.setRealtime=function setRealtime(inputController, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------			
	try {
		if(typeof inputController != 'undefined') {
			if (self.realtime==null) { 
				self.realtime=inputController; 
				self.traza.printObject (self.traza.TRACE, "communication.realtime.init()", self.realtime, "...self.realtime=");		
				
			} else {
				self.traza.print (self.traza.WARN, "communication.realtime.connection.setRealtime()", "Trying to switch Real-Time Controller... not allowed yet, keeping existing one.");			
			}
			
		} else {
			self.traza.print (self.traza.WARN, "communication.realtime.connection.setRealtime()", "Missing Input Argument.... inputController:[" + typeof inputController +"]");			
			self.traza.print (self.traza.WARN, "communication.realtime.connection.setRealtime()", "Error linking current Connection engine to Real-Time Controller. Unknown condition.");			
		}
		
	} catch (e) {
		self.traza.print (self.traza.ERROR, "communication.realtime.connection.setRealtime()", "Error linking current Connection engine to Real-Time Controller. Unknown condition.");
		self.traza.print (self.traza.ERROR, "communication.realtime.connection.setRealtime()", ".... inputController:[" + typeof inputController + "]");			
		self.traza.treatError(e);		
	}	
};
	

/**
*<!--            SET STATELESS CHANNEL
*===============================================-->
* @param  {inputController} Real Time Controller pointer
* @see    communication.realtime
**************************************************/ 
Connection.prototype.setStatelessChannel=function setStatelessChannel(channel, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		

	// 2.- Variables
	var indice=0;
	
	
	// ----------------- ACTIONS ----------------			
	try {
		if(typeof channel != 'undefined') {
			self.statelessChannel=channel;
			self.traza.printObject (self.traza.TRACE, "communication.realtime.connection.setStatelessChannel()", self.statelessChannel, "...self.statelessChannel=");		
			
			
		} else {
			self.traza.print (self.traza.WARN, "communication.realtime.connection.setStatelessChannel()", "REAL-TIME PUBLIC CONNECTIONS - Missing Input Argument.... channel=[" + typeof channel +"]");			
			self.traza.print (self.traza.WARN, "communication.realtime.connection.setStatelessChannel()", "REAL-TIME PUBLIC CONNECTIONS - Error linking current Connection engine to Stateless Channel. Unknown condition.");			
		}
		
	} catch (e) {
		self.traza.print (self.traza.ERROR, "communication.realtime.connection.setStatelessChannel()", "REAL-TIME PUBLIC CONNECTIONS - Error linking current Connection engine to Stateless Channel. Unknown condition.");
		self.traza.print (self.traza.ERROR, "communication.realtime.connection.setStatelessChannel()", "REAL-TIME PUBLIC CONNECTIONS - .... channel=[" + typeof channel + "]");			
		self.traza.treatError(e);		
	}	
};

/**
*<!--            GET SOCKET POOL
*===============================================-->
* @return  socket.io pool of connections.
* @see     socket.io
**************************************************/ 
Connection.prototype.getSocketPool = function getSocketPool(that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------		
	try { 
		return self.socketPool; 
	} catch (e) {
		self.traza.print (self.traza.ERROR, "communication.realtime.connection.getSocketPool()", "REAL-TIME PUBLIC CONNECTIONS- Something misconfigure in the assignation.");
		self.traza.treatError(e);
	}		 
};	

//***********************************************************
//*                        EVENTS
//**********************************************************/	


//***********************************************************
//*                 PRIVATE ACTIONS
//**********************************************************/	

//------------------------------------------------
//		    DEFINE SOCKET POOL EVENTS
//		 private defineSocketPoolEvents() 
//------------------------------------------------               
//	    Define properties of the channel.
//------------------------------------------------
Connection.prototype.defineSocketPoolEvents = function defineSocketPoolEvents(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------			
	try { 	

		// 1.- Socket.IO standard events (Room)
		//------------------------------
		/*			
		socket.on('disconnect', function()            { self.onDisconnect(socket); });				
	 	socket.on('connect', function(room)           { self.onConnect(socket); });			
		socket.on('connect_error', function(room)     { self.onConnectError(socket); });				
		socket.on('connect_timeout', function(room)   { self.onConnectTimeout(socket); }); 
	  	socket.on('disconnect_error', function(room)  { self.onDisconnectError(socket); });				
		socket.on('disconnect_timeout', function(room){ self.onDisconnectTimeout(socket); })		
		socket.on('reconnecting', function(room)      { self.onReconnecting(socket); });			
		socket.on('reconnect_error', function(room)   { self.onReconnectError(socket); });				
		socket.on('reconnect_failed', function(room)  { self.onReconnectTimeout(socket); })		
		 */
		
		
	
	} catch (e) {
		self.traza.print (self.traza.ERROR, "communication.realtime.connection.defineSocketPoolEvents()", "REAL-TIME PUBLIC CONNECTIONS- Socket.io Pool Events.");
		self.traza.treatError(e);
	}	
};

//------------------------------------------------
//		   SET SOCKET POOL PROPERTIES
//		private setSocketPoolProperties() 
//------------------------------------------------               
//	    Define properties of the channel.
//------------------------------------------------
Connection.prototype.setSocketPoolProperties = function setSocketPoolProperties(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------			
	try { 	
		
		//WsChannel.io.configure('production', function(){

			// 0.- Logging							
			//--------------
			self.traza.print (self.traza.TRACE, "communication.realtime.connection.setSocketPoolProperties()", "REAL-TIME PUBLIC CONNECTIONS - Dump Socket.io Pool Configuration.");				

			// 1.- Socket.io transport options
			//-------------------------------
	        //WsChannel.io.enable('browser client minification');  // send minified client
	        //WsChannel.io.enable('browser client etag');          // apply etag caching logic based on version number
	        //WsChannel.io.enable('browser client gzip');          // gzip the file
	        self.socketPool.set('log level', 3);                    // reduce logging
	        self.socketPool.set('transports', [    
	            'polling'              
	          , 'websocket' 
	          , 'flashsocket' 
	          , 'xhr-polling'
	          , 'jsonp-polling'
	        ]);
	    
	  //});					
		
	} catch (e) {
		self.traza.print (self.traza.ERROR, "communication.realtime.connection.setSocketPoolProperties()", "REAL-TIME PUBLIC CONNECTIONS- Socket.io Pool Configuration.");
		self.traza.treatError(e);
	}	
};	

//------------------------------------------------
//	  	       START SOCKET POOL
//		  private startSocketPool() 
//------------------------------------------------               
//	  Start the pool of connections
//------------------------------------------------
Connection.prototype.startSocketPool=function startSocketPool(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------			
	try {
		
		
		if(typeof self.statelessChannel != 'undefined') {
			if(self.statelessChannel != null) {
		
				 // 1.- Start Listening
				//----------------------
				self.socketPool =  io.listen(self.statelessChannel);
		
				if (typeof self.socketPool != 'undefined') {
					
					// 2.- Set Pool Properties
					//------------------------
					self.setSocketPoolProperties();
					
					// 3.- Set State Machine of the pool
					//-----------------------------
					self.defineSocketPoolEvents(self);
					
					// 4.- Emit Event
					//---------------
					self.emit('connection-ready');
					
					
				} else {
					self.traza.printObject (self.traza.WARN, "communication.realtime.connection.startSocketPool()",
					statelessChannel, "REAL-TIME PUBLIC CONNECTIONS - Unable to bind pool to statelessChannel=");
				}
				
			} else {
				self.traza.print (self.traza.WARN, "communication.realtime.connection.startSocketPool()", 
						"REAL-TIME PUBLIC CONNECTIONS - NULL Argument... Stateless Channel where signalling traffic should flow.");				
			}
			
		} else {
			self.traza.print (self.traza.WARN, "communication.realtime.connection.startSocketPool()", 
					"REAL-TIME PUBLIC CONNECTIONS - Missing Argument... Stateless Channel where signalling traffic should flow.");				
		}

	} catch (e) {
		self.traza.print (self.traza.ERROR, "communication.realtime.connection.startSocketPool()",
				"REAL-TIME PUBLIC CONNECTIONS - Unable to start a pool of Sockets, see socket.io documentation");
		self.traza.treatError(e);
	}	
};

//***********************************************************
//*                  PUBLIC INITIALIZATIONS
//*                 (common to all objects)
//**********************************************************/	

/**
*<!--               INIT 
*===============================================-->
*   Set signalling configuration, what to use
*    
* @param  server HTTP server object for piggyback attachment
* @see    communication.realtime
**************************************************/ 
Connection.prototype.init = function init(config, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------			
	try { 
		
		// 1.- Set Listener	
		self.traza.print (self.traza.DEBUG, "communication.realtime.connection.init()", "REAL-TIME PUBLIC CONNECTIONS - Iniciating, setting configuration profile.");
		self.traza.printObject (self.traza.TRACE, "communication.realtime.connection.init()", config, "config=");		
		self.setRealtime(config.realtime);
		self.setStatelessChannel(config.channel);
		
		
	} catch (e) {
		self.traza.print (self.traza.ERROR, "communication.realtime.connection.init()", "REAL-TIME PUBLIC CONNECTIONS - Adding a Signalling Server to the current HTTP one.");
		self.traza.treatError(e);
	}		 
};

/**
*<!--               START
*===============================================-->
*   Start conversation within the pool
*    
* @see    listener.server
**************************************************/ 
Connection.prototype.start = function start(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// 2.- Local Variables
	var txt;
	
	// ----------------- ACTIONS ----------------			
	try { 

		// 0.- Log entry
		//--------------
		if(typeof self.statelessChannel.address != 'undefined') {txt=self.statelessChannel.address();}
		self.traza.print (self.traza.DEBUG, "communication.realtime.connection.start()", "REAL-TIME PUBLIC CONNECTIONS - Adding interactivity to... self.statelessChannel.address()=", txt);				
		
		// 1.- Start Pool of Connections
		//--------------
		self.startSocketPool();

		
	} catch (e) {
		self.traza.print (self.traza.ERROR, "communication.realtime.connection.start()", "REAL-TIME PUBLIC CONNECTIONS - Starting a new conversation.");
		self.traza.treatError(e);
	}		 
};
Inheritance.inherits(Connection,Events); 
module.exports = Connection;




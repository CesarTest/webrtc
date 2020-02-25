"use strict"
//**********************************************************
//  PROTOTYPE ENVIRONMENT
//**********************************************************
/*
*  Responsabilities... BEWARE, index is related to launching order 
*/
Listener.HTML_ENGINE        = Number('0'); // HTML Engine
Listener.HTTP_CHANNEL       = Number('1'); // Static Public Resources: Stateless Channels
Listener.HTTPS_CHANNEL      = Number('2'); // Static Public Resources: Stateless Channels
Listener.REALTIME           = Number('3'); // Dynamic Resources: Realtime Interactivity

/*
* Module dependencies... 
*     Each module is a prototype object within the server awaiting for runtime requests.
*     Objects created with 'new' command inherit all methods and properties of the prototype.     
*/
try {

	// POLICIES: 
	//   - Methods outside constructor... prototype is fixed from the very beginning.
	//   - Using 'this' in prototype methods... using object properties, not prototype ones.
	//   - BEWARE: events must be defined according to a certain pattern, since in those methods 'this' points to the event, no the object.
	var
		// 0.- Tools
		  Trazador   = require('../utils/trazador.js')	
		, Inheritance= require('util')
		, Events     = require('events')		
		, debug      = require('debug')('webrtc-lab:server')

		// 1.- Fake Certificates (HTTPS purposes)
		, fs = require('fs')
	
		// 2.- Real Time Server
		, Resources=[];
	
	// List of Prototypes (controls behaviour, comment modules not required)
	Resources[Listener.HTML_ENGINE]  = require('../content/html.js');	
	Resources[Listener.HTTP_CHANNEL] = require('http');
	Resources[Listener.HTTPS_CHANNEL]= require('https');
	Resources[Listener.REALTIME]     = require('./realtime.js');

} catch (e) {
	
	// Logging System still not working, console printing	
	console.log("[communication.listener.main()] - FATAL: Not able to load modules. Exiting.");
	console.error("[communication.listener.main()] - FATAL:Not able to load modules. Exiting.");
	console.error(e);
	console.error(e.stack);
	process.exit(0);
}

//***********************************************************
//*                  DEFAULT VALUES
//**********************************************************/
Listener.prototype.ports=[];
Listener.prototype.ports[Listener.HTTP_CHANNEL] =[ Number('3000'), Number('3002') ];
Listener.prototype.ports[Listener.HTTPS_CHANNEL]=[ Number('3001') ];

/**
 *<!--	           LISTENER.SERVER
 *========================================================--> 
 *
 * <p><b> RESPONSABILITIES: </b>
 * 
 *  <table>
 *  
 *  	<!-- Responsability Header  --> 
 *  	<tr><td colspan='2'>Serve static contents of a real-time web pages. </td></tr>
 *  	<tr> <td>EVENTS </td>  <td>ACTIONS </td></tr>
 *  
 *  	<!-- Responsability Contents --> 
 *  	<tr>
 *  		<td> Connect HTTP/HTTPS Channels, in any configuration. </td>
 *      	<td> 
 *      		<ul> 
 *      			<li> 1.- User Events </li>
 *      			<li> 2.- HTTP/HTTPS channel events </li>   
 *      		</ul>
 *      	</td> 
 *  	</tr> 
 *  
 *  </table>
 * </p>   
 *
 * <p><b> NOTE: how full responsabilities delegation works? </b>
 *    Need to study best method for using external severs (NGIX, Apache, etc.)
 *     Best, just to unplug the listener, full responsability delegation.
 *     In such cases... just attach signalling alone... is that possible?
 * </p>
 *
 * <p><b> INITIALIZATIONS: </b>
 *	<ul>
 *		<li><strong>Init:</strong> set object properties and events.</li>
 *		<li><strong>Start:</strong> start listening.</li>
 * </ul>
 * </p>
 *   
 *  <p><b> STATIC CONTENTS IN NODE.JS:</b>
 *   Server of the Listener, a 3-layers client-server structure:
 *   <ul>
 *     <li>Layer 3: Application Server... HTML / Signalling.Session</li>
 *     <li>Layer 2: HTTP server / Signalling.Channel</li>
 *     <li>Layer 1: Client (browser code)</li>
 *   </ul>
 *  
 *   
 *    Future versions should allocate Channel events in 
 *    other class, inside application module.
 * </p>
 *     
 *<!--====================================================-->
 * @constructor  
 * @param  {port}  Listening Port, must be Number
 * @see     www*
 * @date    28/11/2016                   
 * @author  Cesar Delgado Gonzalez
 ************************************************************/
function Listener(logger) {

	//**********************************************************
	//  PRIVATE PROPERTIES
	//**********************************************************
	// Self Pointer
	var self=this;

	// Logger pointer
	self.traza;
	if(typeof logger != 'undefined') {self.traza=logger;}
	else {self.traza=new Trazador();}
	
	// Channels
	self.resources=[];
	self.numberResources=[];
	
	// Certificate
	self.privateKey = fs.readFileSync('fakekeys/privatekey.pem').toString(),
	self.certificate = fs.readFileSync('fakekeys/certificate.pem').toString();
	
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
	//              (it is not require to validate who and how is accessing to this memory)
	//              therefore, as a workaround, we just hide those functions to the developer eyes in the JSDoc.

	
	//**********************************************************
	//  ACTIONS: Wait for Events
	//**********************************************************	
	 Events.EventEmitter.call(self); // Start Listener
	
};

//***********************************************************
//*                   PRIVATE METHODS
//*            Getter/Setters... just jump this section
//**********************************************************/

/**
*<!--            SET NUMBER RESOURCES
*===============================================-->
* @param   {html} Pointer to HTML contents generator
* @see     listener.server
**************************************************/ 
Listener.prototype.setNumberResources = function setNumberResources(profile, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}
	
	// ----------------- ACTIONS ----------------	
	try {
		
		// 1.- HTML Engine
		self.numberResources[Listener.HTML_ENGINE]=Number('1');
		
		// 2.- Stateless Channels
		if(typeof self.ports[Listener.HTTP_CHANNEL] != 'undefined') {
			if(typeof self.ports[Listener.HTTP_CHANNEL] != null) { self.numberResources[Listener.HTTP_CHANNEL]=self.ports[Listener.HTTP_CHANNEL].length;}			
		}
		if(typeof self.ports[Listener.HTTPS_CHANNEL] != 'undefined') {
			if(typeof self.ports[Listener.HTTPS_CHANNEL] != null) { self.numberResources[Listener.HTTPS_CHANNEL]=self.ports[Listener.HTTPS_CHANNEL].length;}			
		}
		
		// 3.- HTML Engine
		self.numberResources[Listener.REALTIME]=Number('1');			
		
	} catch (e) {
		self.traza.error ("communication.listener.setNumberResources()", "LISTENER - Error setting the number of resources. Unknown condition");		
		self.traza.treatError(Trazador.ERROR, e);		
	}	
};		

/**
*<!--            SET HTML GENERATOR
*===============================================-->
* @param   {html} Pointer to HTML contents generator
* @see     listener.server
**************************************************/ 
Listener.prototype.setHtmlGenerator = function setHtmlGenerator(app, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}
	
	// ----------------- ACTIONS ----------------	
	try {
		if(typeof app != 'undefined') {
			if (app != null) {self.resources[Listener.HTML_ENGINE]=app;}				
		}
		
	} catch (e) {
		self.traza.error ("communication.listener.setHtmlGenerator()", "LISTENER - Error linking current Listener to HTML App. Unknown condition");
		self.traza.error ("communication.listener.setHtmlGenerator()", "LISTENER - .... app:[" + typeof app + "]");			
		self.traza.treatError(Trazador.ERROR, e);		
	}	
};		

/**
*<!--            SET HTTP CHANNELS
*===============================================-->
* @param   {channel} Array of Stateless Channels
* @see     listener.server
**************************************************/ 
Listener.prototype.setHttpChannels = function setHttpChannels(channels, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}
	
	// ----------------- ACTIONS ----------------	
	try {
		if(typeof channels != 'undefined') {
			if (channels != null) {
				self.resources[Listener.HTTP_CHANNEL]=channels;
				self.numberResources[Listener.HTTPS_CHANNEL]=channels.length;
			}				
		}
		
	} catch (e) {
		self.traza.error ("communication.listener.setHttpChannels()", "LISTENER - Error linking current Listener to HTTPS channel. Unknown condition");
		self.traza.error ("communication.listener.setHttpChannels()", "LISTENER - .... channel:[" + typeof channels + "]");			
		self.traza.treatError(Trazador.ERROR, e);		
	}	
};

/**
*<!--            SET HTTPS CHANNELS
*===============================================-->
* @param   {channel} Array of Stateless Channels
* @see     listener.server
**************************************************/ 
Listener.prototype.setHttpsChannels = function setHttpsChannels(channels, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}
	
	// ----------------- ACTIONS ----------------	
	try {
		if(typeof channels != 'undefined') {
			if (channels != null) {
				self.resources[Listener.HTTPS_CHANNEL]=channels;
				self.numberResources[Listener.HTTPS_CHANNEL]=channels.length;
			}				
		}
		
	} catch (e) {
		self.traza.error ("communication.listener.setHttpChannels()", "LISTENER - Error linking current Listener to HTTPS channel. Unknown condition");
		self.traza.error ("communication.listener.setHttpChannels()", "LISTENER - .... channel:[" + typeof channels + "]");			
		self.traza.treatError(e);		
	}	
};

/**
*<!--            GET HTTP CHANNELS
*===============================================-->
* @return  Array of Stateless Channels
* @see     http
**************************************************/
Listener.prototype.getHttpChannels = function getHttpChannels(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}
	
	// ----------------- ACTIONS ----------------	
	try { 
		return self.resources[Listener.HTTP_CHANNEL];
	} catch (e) {
		self.traza.error("communication.listener.getHttpChannel()", "LISTENER - Something misconfigure in the assignation.");
		self.traza.treatError(e);
	}		 
};

/**
*<!--            GET HTTPS CHANNELS
*===============================================-->
* @return  Array of Stateless Channels
* @see     http
**************************************************/
Listener.prototype.getHttpsChannels = function getHttpsChannels(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}
	
	// ----------------- ACTIONS ----------------	
	try { 
		return self.resources[Listener.HTTPS_CHANNEL];
	} catch (e) {
		self.traza.error("communication.listener.getHttpsChannel()", "LISTENER - Something misconfigure in the assignation.");
		self.traza.treatError(e);
	}		 
};

/**
*<!--            GET HTML GENERATOR
*===============================================-->
* @return  HTML generator of the listener
* @see     content.html
**************************************************/ 
Listener.prototype.getHtmlGenerator = function getHtmlGenerator(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}
	
	// ----------------- ACTIONS ----------------		
	try { 
		return self.resources[Listener.HTML_ENGINE];
	} catch (e) {
		self.traza.error("communication.listener.getHtmlGenerator()", "LISTENER - Something misconfigure in the assignation.");
		self.traza.treatError(Trazador.ERROR, e);
	}		 
};

/**
*<!--          GET REAL-TIME CONTROLLER
*===============================================-->
* @return  Pointer to Real-Time Controller
* @see     communication.realtime
**************************************************/ 
Listener.prototype.getRealtimeController = function getRealtimeController(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}
	
	// ----------------- ACTIONS ----------------	
	try { 
		return self.realtime;
	} catch (e) {
		self.traza.error ("communication.listener.getRealtimeController()", "LISTENER - Something misconfigure in the assignation.");
		self.traza.treatError(e);
	}		 
};

//***********************************************************
//*                   PRIVATE METHODS
//*               State's Machine Definition
//**********************************************************/

//------------------------------------------------
//              ON_ERROR
//           private onError() 
//------------------------------------------------               
//Exit and print error message when listener is unable to start.
//------------------------------------------------
Listener.prototype.onError=function onError (error, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}
	
	// 2.- Local Environment
	let bind;
	
	// ----------------- ACTIONS ----------------		
	try {	
		if (error.syscall !== 'listen') {
			throw error;
		}
	
		bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;
		
		//handle specific listen errors with friendly messages
		switch (error.code) {
			case 'EACCES':
				console.error(bind + ' requires elevated privileges');
				process.exit(1);
				break;
			case 'EADDRINUSE':
				console.error(bind + ' is already in use');
				process.exit(1);
				break;
			default:
				throw error;
		}
	
	} catch (e) {
		self.traza.error ("communication.listener.onError()", "LISTENER - Channel Error events Handling"); 	
		self.traza.treatError(e);
	}		
};

//------------------------------------------------
//                ON_LISTENING
//            private onListening() 
//------------------------------------------------               
//  Channel on listening events handling
//------------------------------------------------
Listener.prototype.onListening=function onListening(index, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	
	// 1.- Setting 'self'
	var self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// 2.- Local Environment
	var addr, bind;
	var indice=0;
		
	// ----------------- ACTIONS ----------------	
	try {	
		if(typeof index != 'undefined') {indice=index;}
		addr = self.channels[indice].address();
		bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
		debug('Listening on ' + bind);
	} catch (e) {
		self.traza.error("communication.listener.onListening()", "LISTENER - Channel Listening events Handling"); 	
		self.traza.treatError(e);
	}			
};

//------------------------------------------------
//              INCOMING HTTP MESSAGE
//            private incomingHttpMessage() 
//------------------------------------------------               
//  EVENT: Incoming HTTP Message
//------------------------------------------------
Listener.prototype.incomingHttpMessage = function incomingHttpMessage(res, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// ----------------- ACTIONS ---------------		
	try {		
	  console.log("Incoming Message");
	  console.log('STATUS: ' + res.statusCode);
	  console.log('HEADERS: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');
	  res.on('data', function (chunk) {
	  console.log('BODY: ' + chunk);
	  });
	} catch (e) {
		self.traza.error ("communication.listener.incomingHttpMessage()", "LISTENER - Dumping Incoming HTTP Message"); 	
		self.traza.trearError(e);
	}	
};

//***********************************************************
//*                         EVENTS
//*               (common to all objects)
//**********************************************************/	
Listener.prototype.events = function events(resource, type, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)               {self=this;}		
	
	var tipo='desconocido';
	
	// ----------------- ACTIONS ----------------		
	try {
		
		// 1.- Capture input parameter
		//------------------
		if (typeof type != 'undefined') {tipo=type;}
		
		// 2.- Define Events
		//----------------------
		if(typeof resource != 'undefined') {
			if(resource != null) {
				switch (tipo) {
					
					// Responsability: HTTP Channel
					case Listener.HTTP_CHANNEL:
						resource.on("error", function(error)    { self.onError(error,self); });
						resource.on("listening", function(port) { self.onListening(i,self); });		
					break;

					// Responsability: HTTPS Channel
					case Listener.HTTPS_CHANNEL:
						resource.on("error", function(error)    { self.onError(error,self); });
						resource.on("listening", function(port) { self.onListening(i,self); });		
					break;
					
					// Responsability: HTML Engine				
					case Listener.HTML_ENGINE:
						//resource.on('connection-ready', function(resources) { self.onResourceReady(resources, self); });
						break;
						
					// Responsability: Management Channel
					case Listener.REALTIME:
						break;
						
					default:
						break;
					}
			}
		}
	} catch (e) {
		self.traza.error ("communication.listener.connectionEvents()", "REAL-TIME CONTROLLER - Configuring Connection Events.");
		self.traza.error(self.traza.ERROR, e);
	}		 
};

//***********************************************************
//*                     STARTING OBJECT
//**********************************************************/	

/**
*<!--            START RESOURCE
*===============================================-->
* @param  {resource} Prototype to be Iniciated.
* @see     communication.listener
**************************************************/ 
Listener.prototype.startResource=function startResource(Resource, type, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// 2.- Local Environment
	var properties;
	var resource;
	var engine;
	
	// ----------------- ACTIONS ----------------		
	try {
		if (Resource!=null) {
			
			// 0.- Log Entry
			//--------------
			self.traza.debug( "communication.listener.startResource()","LISTENER - Starting Resource.");
			self.traza.printObject (self.traza.TRACE, "communication.listener.startResource()", type, "..........type=");		
			self.traza.printObject (self.traza.TRACE, "communication.listener.startResource()", Resource, "..resource=");
			
			// 1.- Propeties  
			//-------------
			properties= {
					   'listener'  : self
					 , 'bus'       : '1'
					 , 'traza'     : self.traza
				};
				
			// 2.- Launch Resources
			//----------------------
			for (let i=0; i<self.numberResources[type] ; i++) {
	
				// ...... 2.1.- Create Resource
				if(typeof Resource  == 'function') { resource=new Resource(self.traza);} 
				if(typeof Resource.createServer == 'function') {
					if(self.resources[Listener.HTML_ENGINE]!=null) {
						
						engine=self.resources[Listener.HTML_ENGINE][0].getHtmlEngine();
						if (engine!=null) {
							if(type==Listener.HTTP_CHANNEL)  {resource=Resource.createServer(engine);}
							if(type==Listener.HTTPS_CHANNEL) {resource=Resource.createServer({key: self.privateKey, cert: self.certificate}, engine);}
						}
					} else {
						self.traza.error( "communication.listener.startResource()","LISTENER - Unable to start Stateless Channel... No HTML Engine.");
					}
				}			
				
				// ...... 2.2.- On Success
				if (resource!=null)  {
					
					// 2.2.1.-- Initiate Resource
					if(typeof resource.init         == 'function') {resource.init(properties);}
					
					// 2.2.2.- Define events of resource
					self.events(resource, self);
		
					// 2.2.3.- Start Resource
					if(typeof resource.start         == 'function') { resource.start();}
					if(typeof resource.listen        == 'function') { 
						self.traza.printObject (self.traza.TRACE, "communication.listener.startResource()", self.ports[type][i], "Start Server at port=");
						resource.listen(self.ports[type][i]);
						self.traza.printObject (self.traza.INFO, "communication.listener.startResource()", resource.address(), "Server started, resource.address()=");				
					}
					
					// 2.2.4.- Instances of earch Prototype
					if(typeof self.resources[type] == 'undefined') {
						self.resources[type] = [ resource ]; // First Element of the array
					} else {
						self.resources[type].push(resource); //	Next Elements of the array
					}
				}
			}
		}
		
	} catch (e) {
		self.traza.error ("communication.listener.startResources()", "LISTENER - Starting Listener resources.");
		self.traza.treatError(e);		
	}	
};

/**
*<!--              INIT
*===============================================-->
*          Init listener
*   
* @see    www
**************************************************/ 
Listener.prototype.init = function init(config, that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self;
	if (typeof that!='undefined') {self=that;}
	if (self==null)               {self=this;}

	// ----------------- ACTIONS ---------------	
	try {

		// 0.- Log Entry
		//-------------------		
		self.traza.debug( "communication.listener.init()","LISTENER - Iniciating, setting configuration profile.");		
		self.traza.printObject (self.traza.TRACE, "communication.listener.init()", config,     "....config=");
		
		// 1.- Set properties
		//-------------------
		if(typeof config.traza      != 'undefined') {self.traza    = config.traza; }  
		
		// Setter must be created to properly set values
		if(typeof config.httpPorts  != 'undefined') {self.ports[Listener.HTTP_CHANNEL]   = config.httpPorts; }
		if(typeof config.httpsPorts != 'undefined') {self.ports[Listener.HTTPS_CHANNEL]  = config.httpsPorts; }		
		self.setNumberResources(config);
		
		// 2.- Dumping Resulting Assignation
		//---------------------
		self.traza.printObject (self.traza.TRACE, "communication.listener.init()", self.ports,            "...............self.ports=");
		self.traza.printObject (self.traza.TRACE, "communication.listener.init()", self.numberResources,  "....self.numberResourcess=");		
		
	} catch (e) {
		self.traza.error ("communication.listener.init()", "LISTENER - Unable to initiate the Server. Exiting"); 	
		self.traza.treatError(e);
	}	
};

/**
*<!--           START
*===============================================-->
*           Start listener
*   
* @see    www
**************************************************/ 
Listener.prototype.start = function start(that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// ----------------- ACTIONS ---------------	
	try {
		
		// Sequential Initiation... eventually events mechanism best
		for (let type=0; type<Resources.length; type++) {
			self.startResource(Resources[type], type, self);
		}
			
	} catch (e) {
		self.traza.error ("communication.listener.start()", "LISTENER - Unable to start the Server. Exiting"); 	
		self.traza.treatError(e);
	}	
};
Inheritance.inherits(Listener,Events); 
module.exports = Listener;

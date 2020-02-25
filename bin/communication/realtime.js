"use strict"
//**********************************************************
//  PROTOTYPE ENVIRONMENT
//**********************************************************
/*
*  Responsabilities 
*/
RealTime.PRIVATE = Number('0'); // Private Resources: Internal Buses
RealTime.PUBLIC  = Number('1'); // Public Resources: Connections
RealTime.CONSOLE = Number('2'); // Console: Management Channel

/*
* Module dependencies... 
*     Each module is a prototype object within the server awaiting for runtime requests.
*     Objects created with 'new' command inherit all methods and properties of the prototype.     
*/
try {
	
	// POLICIES: 
	//   - Methods created inside constructor... to have access to self variable all over the object.
	//   - Otherwise, it is much difficult to know exactly which environment I am using each time.
	//   - Therefore... prototypes can't be declared as 'const', I will create methods during first 'new' call.
	var
	
		// Logger
		  Trazador     =  require('../utils/trazador')
		, Inheritance  = require('util')
		, Events       = require('events')
		, Service      = require('../content/service')
		
		// Communications
		, Resources    = [];
	
	Resources[RealTime.PUBLIC]  = require('./realtime/connection') 
	Resources[RealTime.PRIVATE] = require('./realtime/bus')
		
	
} catch (e) {
	
	// Logging System still not working, console printing	
	console.log("[communication.realtime.main()] - FATAL: Not able to load modules. Exiting.");
	console.error("[communication.realtime.main()] - FATAL: Not able to load modules. Exiting.");
	console.error(e.stack);
	process.exit(0);
}

/**
*<!--              REAL TIME
*===============================================-->
* <p><b> RESPONSABILITIES: </b>
*   Bring HTML to life by managing three pools:
*   <ul>
* 		<li><strong>Connection:</strong> using socket.io framework... main namespace.</li>
* 		<li><strong>Room:</strong> chatting system. Unplug it if not required.</li>
* 		<li><strong>Conversation:</strong> peer2peer connections. Unplug it if not reequired.</li>
*   </ul> 
* </p>
*   
* <p><b> INITIALIZATIONS: </b>
*   <ul>
* 		<li><strong>Init:</strong> set current object properties in order to create the pools
*                      and define correctly the events of this object.</li>
* 		<li><strong>Start:</strong> bind server to a Static one and start the pools.</li>
*   </ul> 
* </p>
* 
*<!--====================================================--> 
* @constructor  
* @param  logger Pointer to system's logger object
* @see    listener.server
* @date   1/12/2016                   
* @author Cesar Delgado Gonzalez 
**************************************************/ 
function RealTime(logger) {


	//**********************************************************
	//  PRIVATE PROPERTIES
	//**********************************************************
	// Self Pointer
	var self=this;	
	
	// Logger pointer
	if(typeof logger != 'undefined') {self.traza=logger;}
	else                             {self.traza=new Trazador();}
	// If not logger... then we should create one in the prototype space

	// Listener Pointer 
	self.listener;
	
	// Resources
	self.resources= [];	
	self.resources[RealTime.PUBLIC] = [];
	self.resources[RealTime.PRIVATE]= [];
	
	self.numberResources= [];
	self.numberResources[RealTime.PUBLIC] =0;
	self.numberResources[RealTime.PRIVATE]=0;

	self.numberInactiveResources=[]; // Flag, how connections are activated   
	self.numberInactiveResources[RealTime.PUBLIC] =0;
	self.numberInactiveResources[RealTime.PRIVATE]=0;
	
	
	// Service pointer
	self.service;
	
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
	 Events.EventEmitter.call(self);

};

//***********************************************************
//*                   GETTER / SETTER
//*              getter/setter of properties 
//**********************************************************/	

/**
*<!--            GET CONNECTION
*===============================================-->
* @return  Pool of Connections
* @see     listener.server
**************************************************/ 
RealTime.prototype.getConnections = function getConnections(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// 2.- Output
	var out=[];
	var connections;
	
	// ----------------- ACTIONS ----------------		
	try { 
		
		connections=self.resources[RealTime.PUBLIC];
		for (let i=0; i<connections.length; i++) {
			out[i]=connections[i].getSocketPool();
		}
		
		
	} catch (e) {
		self.traza.error ("communication.realtime.getConnection()", "Something misconfigure in the assignation.");
		self.traza.treatError(e);
	}		

	// ----------------- RETURN ----------------		
	// No resources assignation, just return main socket.io namespace
	return out;
};	

/**
*<!--            GET LISTENER
*===============================================-->
* @return  HTTP server object used by Signalling controller
* @see     listener.server
**************************************************/ 
RealTime.prototype.getListener = function getListener(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------		
	try { 
		return self.listener;
	} catch (e) {
		self.traza.error ("communication.realtime.getListener()", "Something misconfigure in the assignation.");
		self.traza.treatError(e);
	}		 
};

/**
*<!--            SET LISTENER
*===============================================-->
* @param  {inputListener} Listener pointer
* @see     communication.listener
**************************************************/ 
RealTime.prototype.setListener=function setListener(inputListener, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------				
	try {
		if(typeof inputListener != 'undefined') {
			if (self.listener==null) { 
				self.listener=inputListener; 
				self.traza.printObject(self.traza.TRACE, "communication.realtime.setListener()", self.listener, "self.listener=");

			} else {
				self.traza.warn("communication.realtime.setListener()", "REAL-TIME CONTROLLER - Trying to switch Listener... not allowed yet, keeping existing one.");			
			}
			
		} else {
			self.traza.warn("communication.realtime.setListener()", "REAL-TIME CONTROLLER - Missing Input Argument.... inputListener:[" + typeof inputListener +"]");			
			self.traza.warn("communication.realtime.setListener()", "REAL-TIME CONTROLLER - Error linking current HTML engine to calling Listener.");			
		}
		
	} catch (e) {
		self.traza.error ("communication.realtime.setListener()", "REAL-TIME CONTROLLER - Error linking current Signalling engine to calling Listener. Unknown condition");
		self.traza.error ("communication.realtime.setListener()", ".... inputListener:[" + typeof inputListener + "]");			
		self.traza.treatError(e);		
	}	
};

/**
*<!--            GET PUBLIC CHANNELS
*===============================================-->
* @param  {that} Listener pointer
* @see     communication.listener
**************************************************/ 
RealTime.prototype.getPublicChannels=function getPublicChannels(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)               {self=this;}		
	
	var httpChannels=[];
	var httpsChannels=[];
	var statelessChannels=[];
	
	// ----------------- ACTIONS ----------------				
	try {
	 	if(self.listener != null) {
	 		httpChannels     = self.listener.getHttpChannels();
	 		httpsChannels    = self.listener.getHttpsChannels();
	 		if (httpChannels!=null)  {statelessChannels= httpChannels;} 
	 		if (httpsChannels!=null) {statelessChannels= httpsChannels;} 
	 		if ((httpChannels!=null) && (httpsChannels!=null)) {statelessChannels= httpChannels.concat(httpsChannels);} 
	 	}	
		
	} catch (e) {
		self.traza.error ("communication.realtime.getPublicChannels()", "REAL-TIME CONTROLLER - Error getting stateless channels where Realt-Time should be attached");
		self.traza.treatError(e);		
	}
	
	// ----------------- RETURN ----------------	
	return statelessChannels;
};


/**
*<!--            SET NUMBER RESOURCES
*===============================================-->
* @param  {inputListener} Listener pointer
* @see     communication.listener
**************************************************/ 
RealTime.prototype.getNumberResources=function getNumberResources(buses, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------				
	try {
		
		// 1.- Private Resources
		if (typeof buses  != 'undefined') {self.numberResources[RealTime.PRIVATE]=buses;}		
		
		// 2.- Public Resources
		self.numberResources[RealTime.PUBLIC]=self.getPublicChannels().length;
		
		
	} catch (e) {
		self.traza.error ("communication.realtime.setNumberResources()", "REAL-TIME CONTROLLER - Unable to set Number of Resources. Using current ones.");
		self.traza.error ("communication.realtime.setNumberResources()", ".... self.numberResources:[" + self.numberResources + "]");			
		self.traza.treatError(e);		
	}	

	// ----------------- RETURN ----------------		
	return self.numberResources;
	
};

//***********************************************************
//*        RESPONSABILITY: CONSOLE, MANAGEMENT CHANNEL  
//**********************************************************/	

//------------------------------
// EVENTS  
//------------------------------	

//------------------------------
// ACTIONS  
//------------------------------
RealTime.prototype.sendManagementSignal = function sendManagementSignal(signal, that) {
	

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)               {self=this;}		
	
	// ----------------- ACTIONS ----------------		
	try {
		
		// 0.- Log Entry
		//--------------
		self.traza.debug( "communication.realtime.sendManagementSignal()","REAL-TIME CONTROLLER - Sending a Signal over Management Channel.");
		self.traza.printObject (self.traza.DEBUG, "communication.realtime.sendManagementSignal()", signal, "......signal=");
		
		// 1.- Send Signal
		//-------------
		if (typeof signal != 'undefined') {
			self.emit(signal);
		}
	
	} catch (e) {
		self.traza.error ("communication.realtime.sendManagementSignal()", "REAL-TIME CONTROLLER - Sending a signal over Management Channel.");
		self.traza.treatError(e);
	}		 
	
}

//***********************************************************
//*           RESPONSABILITY: PRIVATE RESOURCES
//**********************************************************/	

//------------------------------
// EVENTS  
//------------------------------	

//------------------------------
// ACTIONS  
//------------------------------	

//***********************************************************
//*           RESPONSABILITY: PUBLIC RESOURCES
//**********************************************************/	

//------------------------------
//  EVENTS  
//------------------------------	

//------------------------------
// ACTIONS  
//------------------------------	

//***********************************************************
//*             RESPONSABILITY: RESOURCES
//*         -Common for both public and private-
//**********************************************************/	

//------------------------------
//          EVENTS  
//------------------------------	
RealTime.prototype.onResourceReady = function onResourceReady(type, resources, that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)               {self=this;}		
	
	// 2.- Signal Type
	var signal=[];
	
	// ----------------- ACTIONS ----------------		
	try {
		
		
		// 0.- Log Entry
		//--------------
		self.traza.debug( "communication.realtime.onResourceReady()","REAL-TIME CONTROLLER - EVENT: Resource Ready for Assignation.");
		self.traza.printObject (self.traza.TRACE, "communication.realtime.onResourceReady()", type,      "...........type=");
		self.traza.printObject (self.traza.TRACE, "communication.realtime.onResourceReady()", resources, "......resources=");
		
		// 1.- Check Activation Status
		//-------------------
		if (type != 'undefined') {
			self.numberInactiveResources[type]--;
			if(self.numberInactiveResources[type]==0) {
				signal[RealTime.PUBLIC]='communication-public-ready';
				signal[RealTime.PRIVATE]='communication-private-ready';
				self.sendManagementSignal(signal[type])
			}
		}
		
	} catch (e) {
		self.traza.error ("communication.realtime.onResourceReady()", "REAL-TIME CONTROLLER - EVENT: Resource Ready for Assignation.");
		self.traza.treatError(e);
	}		 
};


//------------------------------
// ACTIONS  
//------------------------------

/**
*<!--            START RESOURCE
*===============================================-->
* @param  {statelessChannel} HTTP Channel where Real-Time will be attached.
* @see     communication.listener
**************************************************/ 
RealTime.prototype.startResource=function startResource(Resource, type, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// 2.- Local Environment
	var properties;
	var resource;
	var list, numberInstances;
	
	// ----------------- ACTIONS ----------------		
	try {

		
		if (Resource != null) {
			
			// 0.- Log Entry
			//--------------
			self.traza.debug( "communication.realtime.startResource()","REAL-TIME CONTROLLER - Starting Resource.");
			self.traza.printObject (self.traza.TRACE, "communication.realtime.startResource()", type, "..........type=");		
			self.traza.printObject (self.traza.TRACE, "communication.realtime.startResource()", Resource, "..resource=");
			
			// 1.- Capture Stateless Channels 
			//-------------
			properties= {
					   'realtime'  : self
					,  'traza'     : self.traza
			};		
	
			
			// 2.- Number of Instances of current Resource Type
			//----------------------
			if(type==RealTime.PUBLIC) {
				list=self.getPublicChannels();
				numberInstances=list.length;
			} else {
				numberInstances=self.getNumberResources()[type];
			}
		
			// 3.- Create Resources
			//----------------------
			for (let i=0 ; i<numberInstances ; i++) {
				
				// 2.1.- Create Resource
				resource=new Resource(self.traza); 
	
				// 2.2.- Initiate Resource
				if(list != null) {properties.channel=list[i];}
				resource.init(properties);
				self.events(resource, self);
	
				// 2.3.- Start Resorce
				resource.start();
	
				// 2.4.- Instances of earch Prototype
				if(typeof self.resources[type] == 'undefined') {
					self.resources[type] = [ resource ]; // First Element of the array
				} else {
					self.resources[type].push(resource); //	Next Elements of the array
				}
			}
		}
		
	} catch (e) {
		self.traza.error ("communication.realtime.startResources()", "REAL-TIME CONTROLLER - Starting real-time resources.");
		self.traza.treatError(e);		
	}	
};

//***********************************************************
//*                         EVENTS
//*                  (common to all objects)
//**********************************************************/	
RealTime.prototype.events = function events(resource, type, that) {
	
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
					
					// Responsability: Private Ressources
					case RealTime.PRIVATE:
						resource.on('bus-ready', function(event)        { self.onResourceReady(RealTime.PRIVATE, event,  self); });
						break;

					// Responsability: Public Ressources					
					case RealTime.PUBLIC:
						resource.on('connection-ready', function(event) { self.onResourceReady(RealTime.PUBLIC, event, self); });
						break;
						
					// Responsability: Management Channel
					case RealTime.CONSOLE:
						break;
						
						
					default:
						resource.on('bus-ready', function(event)        { self.onResourceReady(RealTime.PRIVATE, event, self); });
						resource.on('connection-ready', function(event) { self.onResourceReady(RealTime.PUBLIC, event, self); });
					}
			}
		}
	} catch (e) {
		self.traza.error ("communication.realtime.connectionEvents()", "REAL-TIME CONTROLLER - Configuring Connection Events.");
		self.traza.treatError(e);
	}		 
};

//***********************************************************
//*                  PUBLIC INITIALIZATIONS
//*                  (common to all objects)
//**********************************************************/	

/**
*<!--               INIT 
*===============================================-->
*   Set signalling configuration, what to use
*    
* @param  server HTTP server object for piggyback attachment
* @see    listener.server
**************************************************/ 
RealTime.prototype.init = function init(config, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)               {self=this;}		
	
	// 2.- Local Environment
	var bus='1';
	
	// ----------------- ACTIONS ----------------		
	try { 
		
		// 0.- Log Entry
		//--------------
		self.traza.debug( "communication.realtime.init()","REAL-TIME CONTROLLER - Iniciating, setting configuration profile.");
		self.traza.printObject (self.traza.TRACE, "communication.realtime.init()", config, "config=");
		
		// 1.- Set Configuration
		//-------------------
		if(typeof config.bus       != 'undefined') {bus = config.bus;}
		if(typeof config.traza     != 'undefined') {self.traza = config.traza;}  
		self.setListener(config.listener);
		self.numberInactiveResources=self.getNumberResources(bus);
		
		// 2.- Start Service Daemon
		//-------------------
		self.service=new Service(self.traza);
		self.service.init(self);
		self.service.start();
		
		
	} catch (e) {
		self.traza.error ("communication.realtime.init()", "REAL-TIME CONTROLLER - Adding a interactivity to the current HTTP server.");
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
RealTime.prototype.start = function start(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)               {self=this;}		
	
	// ----------------- ACTIONS ----------------				
	try { 

		// 0.- Log entry
		//--------------
		self.traza.debug( "communication.realtime.start()", "REAL-TIME CONTROLLER - Starting real time communicatons");				
		
		// 1.- Create one connection per Stateless Channel 
		//----------------------
		Resources.forEach(function(Resource, type) {self.startResource(Resource, type, self);});
		// Index of forEach = type
		
	} catch (e) {
		self.traza.error("communication.realtime.start()", "REAL-TIME CONTROLLER - Starting real time services.");
		self.traza.treatError(e);
	}		 
};
Inheritance.inherits(RealTime,Events); 
module.exports = RealTime;

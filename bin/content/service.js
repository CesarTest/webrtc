"use strict"
//**********************************************************
//  PROTOTYPE ENVIRONMENT
//**********************************************************

/*
*  Responsabilities
*/
Service.SERVICE = Number('0'); // Services
Service.BUS     = Number('1'); // Bus Connection
Service.CONSOLE = Number('2'); // Console: Management Channel

/*
* Module dependencies...
*     Each module is a prototype object within the server awaiting for runtime requests.
*     Objects created with 'new' command inherit all methods and properties of the prototype.
*/
try {
	var
		// Logger
		  Trazador     = require('../utils/trazador')
		, Inheritance  = require('util')
		, Events       = require('events')
		, Init         = require('./service/init');

} catch (e) {

	// Logging System still not working, console printing
	console.log("[content.service.main()] - FATAL: Not able to load modules. Exiting.");
	console.error("[content.service.main()] - FATAL: Not able to load modules. Exiting.");
	console.error(e.stack);
	process.exit(0);
}

/**
*<!--	                 SERVICE.JS
*========================================================-->
*
* <p><b> RESPONSABILITIES: </b>
*
*  <table>
*
*  	<!-- Responsability Header  -->
*  	<tr><td colspan='2'>Start Web Services. </td></tr>
*  	<tr> <td>EVENTS </td>  <td>ACTIONS </td></tr>
*
*  	<!-- Responsability Contents -->
*  	<tr>
*  		<td> None. </td>
*      	<td> None. </td>
*  	</tr>
*
*  	<!-- Responsability Header  -->
*  	<tr><td colspan='2'>Request and Assign Resources. </td></tr>
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
*
*<!--====================================================-->
* @constructor
* @param  {logger} Pointer to system's logger object
* @see    communication.realtime
* @date   19/01/2016
* @author Cesar Delgado Gonzalez
************************************************************/
function Service(logger) {

	//**********************************************************
	//  PRIVATE PROPERTIES
	//**********************************************************
	// 0.- Self Pointer
	var self=this;

	// 1.- Logger pointer
	if(typeof logger != 'undefined') {self.traza=logger;}
	else                             {self.traza=new Trazador();}
	// If not logger... then we should create one in the prototype space

	// 2.- Resources Assignation Controller
	self.service;

	// 3.- Resources available for assignation
	self.socketPool;
	self.bus;

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
*<!--             GET CONNECTIONS
*===============================================-->
* @return  Get HTTP/HTTPS Connections
* @see     content.service
**************************************************/
Service.prototype.getSocketPool = function getSocketPool(that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)               {self=this;}

	// ----------------- ACTIONS ----------------
	try {
		return self.socketPool;
	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.getConnections", "SERVICE - Something misconfigure in the assignation.");
		self.traza.treatError(e);
	}
};



/**
*<!--          GET CONSOLE CHANNEL
*===============================================-->
* @return  Console Channel assigned to this object
* @see     communication.realtime
**************************************************/
Service.prototype.getConsoleChannel = function getConsoleChannel(that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)               {self=this;}

	// ----------------- ACTIONS ----------------
	try {
		return self.realtime;
	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.getConsoleChannel", "SERVICE - Something misconfigure in the assignation.");
		self.traza.treatError(e);
	}
};

/**
*<!--            SET REAL TIME CONTROLLER
*===============================================-->
* @param  {inputController} Real Time Controller pointer
* @see    communication.realtime
**************************************************/
Service.prototype.setConsoleChannel=function setConsoleChannel(inputController, that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)               {self=this;}

	// ----------------- ACTIONS ----------------
	try {
		if(typeof inputController != 'undefined') {
			if (self.realtime==null) {
				self.realtime=inputController;
				self.traza.printObject (self.traza.TRACE, "content.service.setConsoleChannel()", self.realtime, "......self.realtime=");

			} else {
				self.traza.print (self.traza.WARN, "content.service.setConsoleChannel()", "Trying to switch Real-Time Controller... not allowed yet, keeping existing one.");
			}

		} else {
			self.traza.print (self.traza.WARN, "content.service.setConsoleChannel()", "Missing Input Argument.... inputController:[" + typeof inputController +"]");
			self.traza.print (self.traza.WARN, "content.service.setConsoleChannel()", "Error linking current Connection engine to Real-Time Controller. Unknown condition.");
		}

	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.setConsoleChannel()", "Error linking current Connection engine to Real-Time Controller. Unknown condition.");
		self.traza.print (self.traza.ERROR, "content.service.setConsoleChannel()", ".... inputController:[" + typeof inputController + "]");
		self.traza.treatError(e);
	}
};


//***********************************************************
//*        RESPONSABILITY: CONSOLE, MANAGEMENT CHANNEL
//**********************************************************/

//------------------------------
//        EVENTS
//------------------------------
Service.prototype.onCommunicationsReady = function onCommunicationsReady(event, that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)               {self=this;}

	// ----------------- ACTIONS ----------------
	try {

		// 0.- Log Entry
		//--------------
		self.traza.debug( "content.service.onCommunicationResourcesReady()","SERVICE - EVENT: Communication Resource Ready for Assignation.");
		self.traza.printObject (self.traza.TRACE, "content.service.onCommunicationsReady()", event, "......event=");

		// 1.- Capture Resources (for the moment, since no Remote Access Interface working)
		//-------------------
		switch (event) {
			case 'public':

					// 1.1.- Start Public Interface Cliente
					if(typeof self.realtime != 'undefined') {
						if(self.realtime != null) {
							self.socketPool=self.realtime.getConnections();
						} else {
							self.traza.print (self.traza.WARN, "content.service.onCommunicationsReady()", "SERVICE - EVENT: Communication system not ready yet. Not doing anything. Resources=null;");
						}
					} else {
						self.traza.print (self.traza.WARN, "content.service.onCommunicationsReady()", "SERVICE - EVENT: Communication system not ready yet.  Not doing anything. Resources=undefined;");
					}

				break;

			case 'private':

				// 1.2.- Start Private Interface Client
				self.bus="1"
				break;
			default:
				break;
		}

		// 2.- Start Services
		//-------------------
		if ((self.bus!=null) && (self.socketPool!=null)) {self.init.start();}



	} catch (e) {
		self.traza.error ("content.service.onCommunicationResourcesReady()", "SERVICE - EVENT: Resource Ready for Assignation.");
		self.traza.treatError(e);
	}
};


//------------------------------
//  ACTIONS
//------------------------------


//***********************************************************
//*                         EVENTS
//*                  (common to all objects)
//**********************************************************/
Service.prototype.events = function events(that) {

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
		// 2.1.- Responsability 1: Sevices
		//self.service.on('service-ready', function() { self.onServiceReady(self); });

		// 2.2.- Responsability 2: Bus (Private Resources)
		self.realtime.on('communication-public-ready', function() { self.onCommunicationsReady('public',self); });

		// 2.3.- Responsability 3: Communications (Public Resources)
		self.realtime.on('communication-private-ready', function() { self.onCommunicationsReady('private',self); });

	} catch (e) {
		self.traza.error ("content.service.events()", "SERVICES - Controlling services resoruces.");
		self.traza.error(self.traza.ERROR, e);
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
Service.prototype.init = function init(callingController, that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof  that!='undefined') {self=that;}
	if (self==null)                {self=this;}

	var initConfigProfile;

	// ----------------- ACTIONS ----------------
	try {

		// 0.- Log Entry
		self.traza.print (self.traza.DEBUG, "content.service.init()","SERVICES - Iniciating.");
		self.traza.printObject (self.traza.TRACE, "content.service.init()", callingController, "callingController=");

		// 1.- Set Real-Time Controller
		//-------------------
		self.setConsoleChannel(callingController);

		// 2.- Initiate Init process
		//-------------------
		initConfigProfile={
				  'controller'     : self
				, 'level'          : '3'
				, 'config'         : ''
		};
		self.init=new Init(self.traza);
		self.init.init(initConfigProfile);


	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.init()", "SERVICES - Unable to iniciate.");
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
Service.prototype.start = function start(that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof  that!='undefined') {self=that;}
	if (self==null)                {self=this;}

	// 2.- Local Properties
	var success=false;

	// ----------------- ACTIONS ----------------
	try {

		self.events(self);

	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.start()", "WEB SERVICES - Unable to start.");
		self.traza.treatError(e);
	}
};

Inheritance.inherits(Service,Events);
module.exports = Service;
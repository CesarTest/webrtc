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
	var
		// Logger
		  Trazador     = require('../../utils/trazador')
		, Inheritance  = require('util')
		, Events       = require('events');

} catch (e) {

	// Logging System still not working, console printing
	console.log("[content.service.init.main()] - FATAL: Not able to load modules. Exiting.");
	console.error("[content.service.init.main()] - FATAL: Not able to load modules. Exiting.");
	console.error(e.stack);
	process.exit(0);
}

/**
*<!--	                 INIT.JS
*========================================================-->
*
* <p><b> RESPONSABILITIES: </b>
*
*  <table>
*
*  	<!-- Responsability Header  -->
*  	<tr><td colspan='2'>Initiate all services. </td></tr>
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
*		<li><strong>Start:</strong> start services, level by level.</li>
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
function Init(logger) {

	//**********************************************************
	//  PRIVATE PROPERTIES
	//**********************************************************
	// 0.- Self Pointer
	var self=this;

	// 1.- Logger pointer
	if(typeof logger != 'undefined') {self.traza=logger;}
	else                             {self.traza=new Trazador();}
	// If not logger... then we should create one in the prototype space

	// 2.- Service Controller: Assign Resources on Request.
	self.serviceController;

	// 3.- Configuration File (init table)
	self.initTable='../../../conf/inittab.json';
	self.initLevel='3';

	// 4.- Init Config (default values)
	self.initConfig=[
		[
			{
		          "path"      : "../service/init/registry"
				, "instances" : '1'
		    	, "config"    : ' '
			}
		]
		, [
			{
		          "path"      : "../service/init/room"
				, "instances" : '1'
		    	, "config"    : ' '
			}
			, {
		         "path"      : "../service/init/tryrabbit"
				, "instances" : '1'
		    	, "config"    : ' '
			}
		]
	];

	//**********************************************************
	//  ACTIONS: Wait for Events
	//**********************************************************
	 Events.EventEmitter.call(self);
};

//***********************************************************
//*                    GETTER / SETTER
//**********************************************************/

/**
*<!--          GET INIT LEVEL
*===============================================-->
* @return  Service Controller assign to this object
* @see     content.service
**************************************************/
Init.prototype.getInitLevel = function getInitLevel(that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)               {self=this;}

	// ----------------- ACTIONS ----------------
	try {
		return self.initLevel;
	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.init.getInitLevel()", "INIT - Something misconfigure in the assignation.");
		self.traza.treatError(e);
	}
};

/**
*<!--            SET INIT LEVEL
*===============================================-->
* @param  {input} Set Level to start
* @see    content.service
**************************************************/
Init.prototype.setInitLevel=function setInitLevel(input, that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof  that!='undefined') {self=that;}
	if (self==null)                {self=this;}

	// ----------------- ACTIONS ----------------
	try {
		if(typeof input != 'undefined') {
			if (input!=null) {
				if (input!='') {
					self.initLevel=Number(input);
				} else {
					self.traza.print (self.traza.WARN, "content.service.init.setInitLevel()", "INIT - Empty Input Argument.... input:[" + input +"]");
					self.traza.print (self.traza.WARN, "content.service.init.setInitLevel()", "INIT - Error Assigning Service Resources Manager. Unknown condition... current value, self.level=[" + self.initLevel +"]");
				}

			} else {
				self.traza.print (self.traza.WARN, "content.service.init.setInitLevel()", "INIT - Null Input Argument.... input:[" + input +"]");
				self.traza.print (self.traza.WARN, "content.service.init.setInitLevel()", "INIT - Error Assigning Service Resources Manager. Unknown condition... current value, self.level=[" + self.initLevel +"]");
			}

		} else {
			self.traza.print (self.traza.WARN, "content.service.init.setInitLevel()", "INIT - Missing Input Argument.... input:[" + typeof input +"]");
			self.traza.print (self.traza.WARN, "content.service.init.setInitLevel()", "INIT - Error Assigning Service Resources Manager. Unknown condition... current value, self.level=[" + self.initLevel +"]");
		}

	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.init.setInitLevel()", "INIT - Error Assigning Service Resources Manager. Unknown condition... current value, self.level=[" + self.initLevel +"]");
		self.traza.print (self.traza.ERROR, "content.service.init.setInitLevel()", "INIT - .... input:[" + typeof input + "]");
		self.traza.treatError(e);
	}
};

/**
*<!--          GET SERVICE CONTROLLER
*===============================================-->
* @return  Service Controller assign to this object
* @see     content.service
**************************************************/
Init.prototype.getServiceController = function getServiceController(that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// ----------------- ACTIONS ----------------
	try {
		return self.serviceController;
	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.init.getServiceController()", "INIT - Something misconfigure in the assignation.");
		self.traza.treatError(e);
	}
};

/**
*<!--            SET SERVICE CONTROLLER
*===============================================-->
* @param  {inputController} Real Time Controller pointer
* @see    communication.realtime
**************************************************/
Init.prototype.setServiceController=function setServiceController(inputController, that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof  that!='undefined') {self=that;}
	if (self==null)                {self=this;}

	// ----------------- ACTIONS ----------------
	try {
		if(typeof inputController != 'undefined') {
			if (inputController!=null) {
				if (inputController!='') {
					if (self.realtime==null) {
						self.serviceController=inputController;
						self.traza.printObject (self.traza.TRACE, "content.service.init.setServiceController()", self.serviceController,         ".............self.serviceController=");

					} else {
						self.traza.print (self.traza.WARN, "content.service.init.setServiceController()", "INIT - Trying to switch Service Controller... not allowed yet, keeping existing one.");
					}
				} else {
					self.traza.print (self.traza.WARN, "content.service.init.setServiceController()", "INIT - Empty Input Argument.... inputController:[" + inputController +"]");
					self.traza.print (self.traza.WARN, "content.service.init.setServiceController()", "INIT - Error Assigning Service Resources Manager. Unknown condition... current value, self.serviceController=[" + self.serviceController +"]");
				}

			} else {
				self.traza.print (self.traza.WARN, "content.service.init.setServiceController()", "INIT - Null Input Argument.... inputController:[" + inputController +"]");
				self.traza.print (self.traza.WARN, "content.service.init.setServiceController()", "INIT - Error Assigning Service Resources Manager. Unknown condition... current value, self.serviceController=[" + self.serviceController +"]");
			}

		} else {
			self.traza.print (self.traza.WARN, "content.service.init.setServiceController()", "INIT - Missing Input Argument.... inputController:[" + typeof inputController +"]");
			self.traza.print (self.traza.WARN, "content.service.init.setServiceController()", "INIT - Error Assigning Service Resources Manager. Unknown condition... current value, self.serviceController=[" + self.serviceController +"]");
		}

	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.init.setServiceController()", "INIT - Error Assigning Service Resources Manager. Unknown condition... current value, self.serviceController=[" + self.serviceController +"]");
		self.traza.print (self.traza.ERROR, "content.service.init.setServiceController()", "INIT - .... inputController:[" + typeof inputController + "]");
		self.traza.treatError(e);
	}
};

/**
*<!--          GET INIT TABLE
*===============================================-->
* @return  Config File with the Init Table
* @see     content.service
**************************************************/
Init.prototype.getInitTable = function getInitTable(that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof  that!='undefined') {self=that;}
	if (self==null)                {self=this;}

	// ----------------- ACTIONS ----------------
	try {
		return self.initTable;
	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.init.getInitTable()", "INIT - Something misconfigure in the assignation.");
		self.traza.treatError(e);
	}
};

/**
*<!--            SET INIT TABLE
*===============================================-->
* @param  {inputFile} Config File with the Init Table
* @see    communication.realtime
**************************************************/
Init.prototype.setInitTable=function setInitTable(inputFile, that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)               {self=this;}

	// ----------------- ACTIONS ----------------
	try {
		if(typeof inputFile != 'undefined') {
			if (inputFile!=null) {
				if (inputFile!='') {
					self.initTable=inputFile;
					self.traza.printObject (self.traza.TRACE, "content.service.init.setInitTable()", self.initTable,         ".............self.initTable=");

				} else {
					self.traza.print (self.traza.WARN, "content.service.init.setInitTable()", "INIT - Empty Input Argument.... inputFile:[" + inputFile +"]");
					self.traza.print (self.traza.WARN, "content.service.init.setInitTable()", "INIT - Error Assigning Service Resources Manager. Unknown condition... current value, self.serviceController=[" + self.initTable +"]");
				}

			} else {
				self.traza.print (self.traza.WARN, "content.service.init.setInitTable()", "INIT - Null Input Argument.... inputFile:[" + inputFile +"]");
				self.traza.print (self.traza.WARN, "content.service.init.setInitTable()", "INIT - Error Assigning Service Resources Manager. Unknown condition... current value, self.serviceController=[" + self.initTable +"]");
			}
		} else {
			self.traza.print (self.traza.WARN, "content.service.init.setInitTable()", "INIT - Missing Input Argument.... inputFile:[" + typeof inputFile +"]");
			self.traza.print (self.traza.WARN, "content.service.init.setInitTable()", "INIT - Error Assigning Service Resources Manager. Unknown condition... current value, self.serviceController=[" + self.initTable +"]");
		}

	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.init.setInitTable()", "INIT - Error Assigning Init Table Configuration File. Using current value, self.serviceController=[" + self.initTable +"]");
		self.traza.print (self.traza.ERROR, "content.service.init.setInitTable()", "INIT - .... inputController:[" + typeof inputFile + "]");
		self.traza.treatError(e);
	}
};

//***********************************************************
//*             RESPONSABILITY: START SERVICES
//**********************************************************/

//------------------------------------------------
//	  	        START SERVICE
//		    private startService()
//------------------------------------------------
//	 Initiate services
//------------------------------------------------
Init.prototype.startService = function startService(description, that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof  that!='undefined') {self=that;}
	if (self==null)                {self=this;}

	// 2.- Local Environment
	var Service, service; // We don't keep track of the services, we just start them, this is registry responsability.
	var replicas=Number("1");

	// ----------------- ACTIONS ----------------
	try {
		if (typeof description.path != 'undefined') {
			Service=require(description.path);
			if (typeof Service != 'undefined') {
				if (typeof description.instances != 'undefined') {replicas=Number(description.instances);}
				for (let i=0; i<replicas; i++) {
					service=new Service(self.traza);
					service.init(self.serviceController);
					service.start();
				}
			} else {
				self.traza.print (self.traza.WARN, "content.service.init.startService()", "INIT - Service not found at.... description.path:[" + typeof description.path +"]");
			}
		} else {
			self.traza.print (self.traza.WARN, "content.service.init.startService()", "INIT - Unable to star Service. Missing Input Argument.... description.path:[" + typeof description.path +"]");
		}
	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.init.startService()","INIT - Unable to initiate a service");
		self.traza.treatError(e);
	}
};

//------------------------------------------------
//	  	        START SERVICES
//		    private startServices()
//------------------------------------------------
//	 Initiate services
//------------------------------------------------
Init.prototype.startLevelServices = function startLevelService(level, that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof  that!='undefined') {self=that;}
	if (self==null)                {self=this;}

	// ----------------- ACTIONS ----------------
	try {
		level.forEach(function(description) {self.startService(description);});


	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.init.startLevelService()","INIT - Unable to initiate a service");
		self.traza.treatError(e);
	}
};

//***********************************************************
//*             RESPONSABILITY: START LEVELS
//**********************************************************/

//------------------------------------------------
//              LOAD INIT TABLE
//           private loadInitTable()
//------------------------------------------------
//          Load configuration file
//------------------------------------------------
Init.prototype.loadInitTable = function loadInitTable(that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof  that!='undefined') {self=that;}
	if (self==null)                {self=this;}

	// ----------------- ACTIONS ----------------
	try {
		if (typeof self.initTable != 'undefined') {
			if (typeof self.initTable != null ) {
					self.initConfig=require(self.initTable);
					self.traza.printObject (self.traza.TRACE, "content.service.init.loadInitTable()", self.initConfig, "INIT - self.initConfig=");
			}
		}

	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.init.loadInitTable()","INIT - Unable to load init table");
		self.traza.treatError(e);
	}
};

//------------------------------------------------
//	  	          START LEVELS
//		    private startLevels()
//------------------------------------------------
//	 Start Services, level by level
//------------------------------------------------
Init.prototype.startLevel = function startLevel(that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof  that!='undefined') {self=that;}
	if (self==null)                {self=this;}

	// ----------------- ACTIONS ----------------
	try {

		// Should Set OnError and onSuccess for each level
		for (let level=2; level<self.initConfig.length+2 ; level++) {
			if(level <= self.initLevel) {
				self.traza.print (self.traza.DEBUG, "content.service.init.startLevel()","INIT - Starting services of Level=" + level);
				self.startLevelServices(self.initConfig[level-2]);
			}
		}

	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.init.startServices()","INIT - Unable to initiate services");
		self.traza.treatError(e);
	}
};


//***********************************************************
//*                OBJECT STATE'S MACHINE
//**********************************************************/
Init.prototype.events = function events(that) {

	// ----------------- ACTIONS ----------------
	try {

	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.init.events()", "INIT - Events definition.");
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
Init.prototype.init = function init(profile, that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)               {self=this;}

	// ----------------- ACTIONS ----------------
	try {

		// 0.- Log Entry
		self.traza.print (self.traza.DEBUG, "content.service.init.init()","INIT - Iniciating.");

		// 1.- Set Real-Time Controller
		self.setServiceController(profile.controller);
		self.setInitLevel(profile.level);
		self.setInitTable(profile.config);

		// 3.- Load Config File
		self.loadInitTable();

	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.init.init()", "INIT - Unable to iniciate.");
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
Init.prototype.start = function start(that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (typeof that!='undefined') {self=that;}
	if (self==null)               {self=this;}

	// 2.- Local Properties
	var success=false;

	// ----------------- ACTIONS ----------------
	try {
		self.startLevel();

	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.service.init.start()", "INIT - Unable to start.");
		self.traza.treatError(e);
	}
};
Inheritance.inherits(Init,Events);
module.exports = Init;
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
	var
		Trazador     =  require('../../utils/trazador')
		, Inheritance= require('util')
		, Events     = require('events');			

} catch (e) {
	
	// Logging System still not working, console printing	
	console.log("[communication.realtime.bus.main()] - FATAL: Not able to load modules. Exiting.");
	console.error("[communication.realtime.bus.main()] - FATAL: Not able to load modules. Exiting.");
	console.error(e.stack);
	process.exit(0);
}

/**
*<!--	                 BUS.JS 
*========================================================--> 
*
* <p><b> RESPONSABILITIES: </b>
* 
*  <table>
*  
*  	<!-- Responsability Header  --> 
*  	<tr><td colspan='2'>Create Resources: Bus of Queues and Exchanges. </td></tr>
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
*      
*<!--====================================================-->
* @constructor  
* @param  {logger} Pointer to system's logger object
* @see    communication.realtime
* @date   19/01/2016                   
* @author Cesar Delgado Gonzalez 
************************************************************/
function Bus(logger) {
	
	//**********************************************************
	//  PRIVATE PROPERTIES
	//**********************************************************
	// 0.- Self Pointer
	var self=this;		

	// 1.- Logger pointer
	var traza;
	if(typeof logger != 'undefined') {self.traza=logger;}
	else                             {self.traza=new Trazador();}
	// If not logger... then we should create one in the prototype space

	// 2.- Signalling pointer
	self.service;

	//**********************************************************
	//  ACTIONS: Wait for Events
	//**********************************************************	
	 Events.EventEmitter.call(self); // Start Listener
	
};


/**
*<!--         GET REAL TIME CONTROLLER
*===============================================-->
* @return  Real time communications controller for this bus
* @see     communications.realtime
**************************************************/ 
Bus.prototype.getRealtimeController = function getRealtimeController(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------				
	try { 
		return self.realtime;
	} catch (e) {
		self.traza.print (self.traza.ERROR, "communication.realtime.bus.getRealtimeController()", "REAL-TIME INTERNAL BUS - Something misconfigure in the assignation.");
		self.traza.error(self.traza.ERROR, e);
	}		 
};


/**
*<!--           SET REAL TIME CONTROLLER
*===============================================-->
* @param  {controller} Real time communications controller for this bus
* @see     communications.realtime
**************************************************/ 
Bus.prototype.setRealtimeController=function setRealtimeController(controller, that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------				
	try {
		if(typeof controller != 'undefined') {
			if (self.realtime==null) { 
				self.realtime=controller; 
			} else {
				self.traza.print (self.traza.WARN, "communication.realtime.bus.setRealtimeController()", "REAL-TIME INTERNAL BUS - Trying to switch Listener... not allowed yet, keeping existing one.");			
			}
			
		} else {
			self.traza.print (self.traza.WARN, "communication.realtime.bus.setRealtimeController()", "REAL-TIME INTERNAL BUS - Missing Input Argument.... controller:[" + typeof controller +"]");			
			self.traza.print (self.traza.WARN, "communication.realtime.bus.setRealtimeController()", "REAL-TIME INTERNAL BUS - Error linking current Room engine to Real Time Controller. Unknown condition.");			
		}
		
	} catch (e) {
		self.traza.print (self.traza.ERROR, "communication.realtime.bus.setRealtimeController()", "REAL-TIME INTERNAL BUS - Error linking current Room engine to Real Time Controller. Unknown condition");
		self.traza.print (self.traza.ERROR, "communication.realtime.bus.setRealtimeController()", "REAL-TIME INTERNAL BUS - .... inputListener:[" + typeof controller + "]");			
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
*   
*    
* @param  {controller} Real-Time Communications Controller for this bus.
* @see    communicaton.realtime
**************************************************/ 
Bus.prototype.init = function init(config, that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------				
	try { 
		// 1.- Set Listener 
		self.traza.print (self.traza.DEBUG, "communication.realtime.bus.init()", "REAL-TIME PRIVATE BUS - Iniciating, setting configuration profile.");
		self.traza.printObject (self.traza.TRACE, "communication.realtime.bus.init()", config, "config=");		
		if(typeof config.realtime  != 'undefined') {self.setRealtimeController(config.realtime); }	
		
	} catch (e) {
		self.traza.print (self.traza.ERROR, "communication.realtime.bus.init()", "REAL-TIME INTERNAL BUS - Unable to iniciate.");
		self.traza.treatError(e);
	}		 
};


/**
*<!--               START
*===============================================-->
*   
*    
* @see    communicaton.realtime
**************************************************/ 
Bus.prototype.start = function start(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------				
	try { 
		
		self.traza.print (self.traza.DEBUG, "communication.realtime.bus.init()", "REAL-TIME PRIVATE BUS - Startinge.");
		self.emit('bus-ready');


			
	} catch (e) {
		self.traza.print (self.traza.ERROR, "communication.realtime.bus.start()", "REAL-TIME INTERNAL BUS - Unable to start.");
		self.traza.error(self.traza.ERROR, e);
	}		 
};
Inheritance.inherits(Bus,Events); 
module.exports = Bus;	




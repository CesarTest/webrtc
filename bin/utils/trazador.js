"use strict"
//***********************************************************
//*                PROTOTYPE GLOBAL VALUES
//**********************************************************/

// Constant Values
Trazador.prototype.TRACE   = Number('0');
Trazador.prototype.DEBUG   = Number('1');
Trazador.prototype.INFO    = Number('2');
Trazador.prototype.WARN    = Number('3');
Trazador.prototype.ERROR   = Number('4');
Trazador.prototype.FATAL   = Number('5');

// Defaults
Trazador.prototype.levels  = ["TRACE", "DEBUG", "INFO", "WARN", "ERROR", "FATAL"]; 
Trazador.prototype.logLevel=Number("5");

//***********************************************************
//*                PROTOTYPE LIBRARIES
//**********************************************************/
// It should inhereit from log4js library


//***********************************************************
//*                PROTOTYPE CONSTRUCTOR
//**********************************************************/

/************************************************************
 *<!--	           TRAZADOR
 *========================================================--> 
 *
 *   Simple logging mechanism.
 *   To be upgraded in future versions... extend log4js module
*    Description: logger to be used by the system.
*   
* @param  {logLevel} Threshold level {DEBUG, INFO, WARN, ERROR, FATAL}
* @see    listener.server
 *<!--====================================================-->
 *   @date      28/11/2016                   
 *   @author  	Cesar Delgado Gonzalez
 ************************************************************/
function Trazador(logLevel) {

	//***********************************************************
	//*                PARAMETERS TREATMENT
	//**********************************************************/
	var self=this;
	if ((logLevel!=null) && (typeof logLevel != 'undefined')) {
		  if (logLevel=='trace') { self.logLevel=Number('0'); }
		  if (logLevel=='debug') { self.logLevel=Number('1'); }
		  if (logLevel=='info')  { self.logLevel=Number('2'); }
		  if (logLevel=='warn')  { self.logLevel=Number('3'); }
		  if (logLevel=='error') { self.logLevel=Number('4'); }
		  if (logLevel=='fatal') { self.logLevel=Number('5'); }
	} 

};

//***********************************************************
//*                   PUBLIC METHODS
//**********************************************************/

/**************************************************
*<!--            PRINT
*===============================================-->
*  Log message  
* @param  {messageLevel} Trace type {0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=FATAL}
* @param  {callingFunction} package.class.method()... who is tracing?
* @param  {message} Message to print.   
**************************************************/	
Trazador.prototype.print = function print(messageLevel, callingFunction, message, param, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	let self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}
	
	var txt=".....";
	
	// ------------ ACTIONS -----------	
	try {
		if(typeof param != 'undefined') {txt=param;}
		if (Number(messageLevel) >= Number(self.logLevel) ) {
				console.log(self.levels[Number(messageLevel)] + " - [" + callingFunction + "] : ", message, txt);
		}
	} catch (e) {
		console.log("ERROR - [utils.trazador.print()]:" + e);
	}
};



/**************************************************
*<!--           TRACE
*===============================================-->
*  Log message  
* @param  {messageLevel} Trace type {0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=FATAL}
* @param  {callingFunction} package.class.method()... who is tracing?
* @param  {message} Message to print.   
**************************************************/	
Trazador.prototype.trace = function debug(callingFunction, message, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	let self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// ------------ ACTIONS -----------	
	try {
		 self.print(self.TRACE,callingFunction, message, self);
	} catch (e) {
		console.log("ERROR - [utils.trazador.trace()]:" + e);
	}
};


/**************************************************
*<!--           DEBUG
*===============================================-->
*  Log message  
* @param  {messageLevel} Trace type {0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=FATAL}
* @param  {callingFunction} package.class.method()... who is tracing?
* @param  {message} Message to print.   
**************************************************/	
Trazador.prototype.debug = function debug(callingFunction, message, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	let self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// ------------ ACTIONS -----------	
	try {
		 self.print(self.DEBUG,callingFunction, message, self);
	} catch (e) {
		console.log("ERROR - [utils.trazador.debug()]:" + e);
	}
};


/**************************************************
*<!--           INFO
*===============================================-->
*  Log message  
* @param  {messageLevel} Trace type {0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=FATAL}
* @param  {callingFunction} package.class.method()... who is tracing?
* @param  {message} Message to print.   
**************************************************/	
Trazador.prototype.info = function debug(callingFunction, message, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	let self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// ------------ ACTIONS -----------	
	try {
		 self.print(self.INFO,callingFunction, message, self);
	} catch (e) {
		console.log("ERROR - [utils.trazador.info()]:" + e);
	}
};



/**************************************************
*<!--           WARN
*===============================================-->
*  Log message  
* @param  {messageLevel} Trace type {0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=FATAL}
* @param  {callingFunction} package.class.method()... who is tracing?
* @param  {message} Message to print.   
**************************************************/	
Trazador.prototype.warn = function warn(callingFunction, message, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	let self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// ------------ ACTIONS -----------	
	try {
		 self.print(self.WARN,callingFunction, message, self);
	} catch (e) {
		console.log("ERROR - [utils.trazador.warn()]:" + e);
	}
};

/**************************************************
*<!--           ERROR
*===============================================-->
*  Log message  
* @param  {messageLevel} Trace type {0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=FATAL}
* @param  {callingFunction} package.class.method()... who is tracing?
* @param  {message} Message to print.   
**************************************************/	
Trazador.prototype.error= function error(callingFunction, message, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	let self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// ------------ ACTIONS -----------	
	try {
		 self.print(self.ERROR,callingFunction, message, self);
	} catch (e) {
		console.log("ERROR - [utils.trazador.error()]:" + e);
	}
};

/**************************************************
*<!--           FATAL
*===============================================-->
*  Log message  
* @param  {messageLevel} Trace type {0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=FATAL}
* @param  {callingFunction} package.class.method()... who is tracing?
* @param  {message} Message to print.   
**************************************************/	
Trazador.prototype.fatal= function fatal(callingFunction, message, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	let self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// ------------ ACTIONS -----------	
	try {
		 self.print(self.FATAL,callingFunction, message, self);
	} catch (e) {
		console.log("ERROR - [utils.trazador.fatal()]:" + e);
	}
};

/**************************************************
*<!--           PRINT STACK
*===============================================-->
*  Dump stack  
*  
* @param  {messageLevel} Trace type {0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=FATAL}
* @param  {callingFunction} package.class.method()... who is tracing?
* @param  {error} Exception throw by the system.   
**************************************************/	
Trazador.prototype.printStack = function printStack(messageLevel,error, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	let self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// ------------ ACTIONS -----------	
	try {			
		if (Number(messageLevel) >= self.logLevel ) {
			console.log(error.stack);
		}
	} catch (e) {
		console.log("ERROR - [utils.trazador.printStack()]:" + e);
	}			
};


/**************************************************
*<!--           ERROR
*===============================================-->
*  Actions to do when errors occur  
*  
* @param  {messageLevel} Trace type {0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=FATAL}
* @param  {callingFunction} package.class.method()... who is tracing?
* @param  {error} Exception throw by the system.   
**************************************************/	
Trazador.prototype.treatError = function treatError(error, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	let self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// ------------ ACTIONS -----------	
	try {		
		if (Number(self.ERROR) >= self.logLevel ) {
			console.log(error.stack);
		}
	} catch (e) {
		console.log("ERROR - [utils.trazador.printStack()]:" + e);
	}			
};


/**************************************************
*<!--          PRINT OBJECT
*===============================================-->
*  Transform object to string and dump it

* @param  {messageLevel} Trace type {0=DEBUG, 1=INFO, 2=WARN, 3=ERROR, 4=FATAL}
* @param  {callingFunction} package.class.method()... who is tracing?
* @param  {object} Object to dump is string format.   
**************************************************/	
Trazador.prototype.printObject = function printObject(messageLevel,callingFunction, object, message, that) {
	
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	let self;
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}
	
	// 2.- Local variables
	let text;
	
	// ----------------- ACTIONS ----------------			
	try {
		if (Number(messageLevel) >= self.logLevel ) {
			text=String(self.levels[Number(messageLevel)] + " - [" + callingFunction + "] : " + message);
			console.log(text, object); 

		}	
	} catch (e) {
		console.log("ERROR - [utils.trazador.printObject()]:" + e);
	}			
};


module.exports = Trazador;

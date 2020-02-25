"use strict"
//**********************************************************
//  PROTOTYPE ENVIRONMENT
//**********************************************************
/*
* Module dependencies... 
*     Each module is an object within the server awaiting for runtime requests.
*     Just one object per module, whatever the number of clients (js projects running on the server).
*/
try {
	
	// POLICIES: 
	//   - Methods created inside constructor... to have access to self variable within methods.
	//   - Otherwise, it is much difficult to know exactly which environment I am using each time.
	//   - Therefore... prototypes can't be declared as 'const', I will create methods during first 'new' call.
	var
		  Trazador =  require('../utils/trazador')
		, Express =  require('./html/express'); 
	
} catch (e) {
	
	// Logging System still not working, console printing	
	console.log("[content.html.main()] - FATAL: Not able to load modules. Exiting.");
	console.error("[content.html.main()] - FATAL: Not able to load modules. Exiting.");
	console.error(e.stack);
	process.exit(0);
}


/**************************************************
*<!--              HTML
*===============================================-->
*   HTML content generator constructor. 
*   Package: content.
*   Description: Called from listener.server
*   
* @constructor  
* @param  
* @see    listener.server
**************************************************/ 
function Html(logger) {

	//**********************************************************
	//	PRIVATE ENVIRONMENT
	//**********************************************************
	// Self Pointer
	var self=this;

	// Logger pointer
	if(typeof logger != 'undefined') {self.traza=logger;}
	else                             {self.traza=new Trazador();}
	
	// Pointers
	var htmlEngine;
	var listener;
 
    // Properties of this object
	var htmlEngineType; 

};


//***********************************************************
//*                   PRIVATE METHODS
//**********************************************************/

/**************************************************
*<!--          GET_LISTENER
*===============================================-->
*   Get pointer to actual HTML content generator.
*   
* @return  application object 
* @see    listener.server
**************************************************/ 
Html.prototype.getListener = function getListener(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------	
	try { 
		return self.listener;
		
	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.html.getContentEngine()", "Content generator object is null or undefined.");
		self.traza.treatError(e);
	}		 
};

/**************************************************
*<!--          GET_HTML_ENGINE
*===============================================-->
*   Get pointer to actual HTML content generator.
*   
* @return  application object 
* @see    listener.server
**************************************************/ 
Html.prototype.getHtmlEngine = function getHtmlEngine(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	let engine;
	
	// ----------------- ACTIONS ----------------		
	try { 
		engine=self.htmlEngine.getContentGenerator();
		if (engine==null) {
			self.traza.printObject (self.traza.WARN, engine, "content.html.getHtmlEngine()=", "HTML engine is undefined. htmlEngine.getContentGenerator()=");
		} 
			
		return engine;
		
	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.html.getHtmlEngine()", "Content generator object is null or undefined.");
		self.traza.treatError(e);
	}		 
};

//------------------------------------------------
//				 SET LISTENER
//	 		private setListener() 
//------------------------------------------------               
//	Set Listener
//------------------------------------------------
Html.prototype.setListener = function setListener(inputListener, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------		
	try {
		
		if(typeof inputListener != 'undefined') {
			if (self.listener==null) { 
				self.listener=inputListener; 
			} else {
				self.traza.print (self.traza.WARN, "content.html.setListener()", "Trying to switch Listener... not allowed yet, keeping existing one.");			
			}
			
		} else {
			self.traza.print (self.traza.WARN, "content.html.setListener()", "Missing Input Argument.... inputListener:[" + typeof inputListener +"]");			
			self.traza.print (self.traza.WARN, "content.html.setListener()", "Error linking current HTML engine to calling Listener.");			
		}
		
	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.html.setListener()", "Error linking current HTML engine to calling Listener. Unknown condition");
		self.traza.print (self.traza.ERROR, "content.html.setListener()", ".... inputListener:[" + typeof inputListener + "]");			
		self.traza.treatError(e);		
	}	
};

//------------------------------------------------
//				  CHOOSE ENGINE
//				private chooseEngine() 
//------------------------------------------------               
//	Pointer to logger
//------------------------------------------------
Html.prototype.chooseEngine = function chooseEngine(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------		
	try {	
		
		
		// 1.- Choose Engine
		//-------------------
		//   (Currently, just express supported)
		self.htmlEngine=new Express(self.traza);
		self.traza.print(self.traza.DEBUG, "content.html.chooseEngine()", "EXPRESS HTML ENGINE... create Object");
		self.traza.printObject(self.traza.TRACE, "content.html.chooseEngine()", self.htmlEngine, "self.htmlEngine=");
		
		// 2.- Start Engine
		//------------------
		self.htmlEngine.start();
		
	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.html.chooseEngine()", "Static content generation engine: unable to start.");
		self.traza.treatError(e);
	}	
};

//***********************************************************
//*                   PUBLIC METHODS
//**********************************************************/



/**************************************************
*<!--             INIT
*===============================================-->
*       Set up Config profile
*   
* @param  {config} Properties of the object
* @see    listener.server
**************************************************/ 
Html.prototype.init = function init(config, that) {

	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------		
	try {
		// 0.- Log Entry
		//--------------
		self.traza.debug( "content.html.init()","HTML ENGINE - Iniciating... setting configuration profile.");
		self.traza.printObject (self.traza.TRACE, "content.html.init()", config, "config=");
		
		// 1.- Set Configuration
		//-------------------
		if(typeof config.traza     != 'undefined') {self.traza = config.traza;}  
		self.setListener(config.listener);
		
	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.html.init()", "HTML ENGINE - Iniciating... setting properties of the object.");
		self.traza.treatError(e);
	}		 
};



/**************************************************
*<!--             START
*===============================================-->
*   Start content generation engine.
*   
* @param  server HTTP server object for piggyback attachment
* @see    listener.server
**************************************************/ 
Html.prototype.start = function start(callerListener, that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}		
	
	// ----------------- ACTIONS ----------------		
	try { 
		self.chooseEngine();
		
	} catch (e) {
		self.traza.print (self.traza.ERROR, "content.html.start()", "Starting static content generation engine.");
		self.traza.treatError(e);
	}		 
};

module.exports = Html;
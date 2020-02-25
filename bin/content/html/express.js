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
		Trazador =  require('../../utils/trazador')
		  
		// Content modules 
		, logger   = require('morgan') 
		, contents = require('express') 
		, path = require('path')
		, favicon = require('serve-favicon')
		, cookieParser = require('cookie-parser')
		, bodyParser = require('body-parser')

		// Routing modules 
		, index = require('./routes/index')
		, users = require('./routes/users');
	
} catch (e) {
	
	// Logging System still not working, console printing	
	console.log("[content.html.express.main()] - ERROR: Not able to load modules. Exiting.");
	console.error("[content.html.express.main()] - ERROR: Not able to load modules. Exiting.");
	console.error(e.stack);
	process.exit(0);
}

//***********************************************************
//*                   PRIVATE METHODS
//**********************************************************/

//------------------------------------------------
//			SET_ENGINE_PROPERTIES
//      private setEngineProperties() 
//------------------------------------------------               
//	Set engine properties 
//------------------------------------------------
Express.prototype.setEngineProperties = function setEngineProperties(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// ----------------- ACTIONS ----------------		
	try {
		self.traza.debug("content.html.express.setEngineProperties()", "Express Engine Properties"); 	

		// view engine setup
		self.app.set('views', path.join(__dirname, './views'));
		self.app.set('view engine', self.viewEngine);

		// uncomment after placing your favicon in /public
		//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
		self.app.use(logger('dev'));
		self.app.use(bodyParser.json());
		self.app.use(bodyParser.urlencoded({ extended: false }));
		self.app.use(cookieParser());
		self.app.use(contents.static(path.join(__dirname, '../../../public')));

		//routing engine setup
		self.app.use('/', index);
		self.app.use('/users', users);		
		
		self.traza.printObject(self.traza.TRACE,"content.html.express.setEngineProperties()", self.app ,"self.app="); 	
		
	} catch (e) {

		self.traza.error("content.html.express.setEngineProperties()", "Unable to set Express Engine properties"); 	
		self.traza.treatError(e);
	} 
}

//------------------------------------------------
//			SET_ENGINE_METHODS
//		private setEngineMethods() 
//------------------------------------------------               
//   Define Engine Methods (State's Machine)
//------------------------------------------------
Express.prototype.setEngineMethods = function setEngineMethods(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// 2.- Local Environment		
	//var err;
	
	// ----------------- ACTIONS ----------------		
	try {
		
		// 1.- Catch 404 and forward to error handler
		//-----------------------
		self.app.use(function(req, res, next) {
		  self.err = new Error('Not Found');
		  self.err.status = 404;
		  next(self.err);
		});

		// 2.- Error handler
		//-----------------------		
		self.app.use(function(err, req, res, next) {
		
			// 2.1.- Set locals, only providing error in development
		  	res.locals.message = err.message;
		  	res.locals.error = req.app.get('env') === 'development' ? err : {};

		  	// 2.2.- Render the error page
		  	res.status(err.status || 500);
		  	res.render('error');
		  	
		});
	
	} catch (e) {
		self.traza.error ("content.html.express.setEngineMethods()", "Unable to set Express Engine methods."); 	
		self.traza.treatError(e);
	} 
}

//***********************************************************
//*                   PUBLIC METHODS
//**********************************************************/

/**************************************************
*<!--         GET_CONTENT_GENERATOR
*===============================================-->
*   Get pointer to content generator object (application).
*   
* @return  application object 
* @see   application.static
**************************************************/ 
Express.prototype.getContentGenerator = function getContentGenerator(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// ----------------- ACTIONS ----------------		
	try { 
		return self.app;
		
	} catch (e) {
		self.traza.error ("content.html.express.getContentGenerator()", "Application objet is null or undefined.");
		self.traza.treatError(e);
	}		 
};


/**************************************************
*<!--             START
*===============================================-->
*   Start the socket.io channels.
*   
* @see    application.static
**************************************************/ 
Express.prototype.start = function start(that) {
	
	// ------------ LOCAL ENVIRONMENT -----------
	// 1.- Setting 'self'
	var self; // WARN: must be var, not let... that means local to the entire function, not only loop
	if (that!='undefined') {self=that;}
	if (self==null)        {self=this;}

	// ----------------- ACTIONS ----------------		
	try { 
		
		self.traza.debug("content.html.express.start()", "EXPRESS ENGINE... starting"); 	
		
		// 1.- Load express
		self.app=contents();
		
		// 2.- Setup properties
		self.setEngineProperties(self);     

		// 3.- Setup methods
		self.setEngineMethods(self);
		
	} catch (e) {
		self.traza.error ("content.html.express.start()", "Starting Express application.");
		self.traza.trearError(e);
	}		 
};


//***********************************************************
//*                       CONSTRUCTOR
//**********************************************************/

/**************************************************
*<!--              EXPRESS
*===============================================-->
*   Express static HTML generation constructor. 
*   Package: content.html
*   Description: Called from the static.
*   
* @param  
* @see    application.express
**************************************************/ 
function Express(logger) {
	
	//**********************************************************
	//  PRIVATE PROPERTIES
	//**********************************************************
	// 0.- Self Pointer
	var self=this;		

	// 1.- Logger pointer
	if(typeof logger != 'undefined') {self.traza=logger;}
	else                             {self.traza=new Trazador();}
	// If not logger... then we should create one in the prototype space

	// HTML Generator
	self.app;
	self.err;

	// Private properties
	self.viewEngine='jade';
	
};
module.exports = Express;

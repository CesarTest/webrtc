/************************************************************
 *<!--	                SESSION.JS
 *========================================================-->
 *
 *   Events and states of a real time user session,
 *        track real time point to point session
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
	var Trazador =  require('../../../../utils/trazador');
	var Conversation = require('../conversation');

} catch (e) {

	// Logging System still not working, console printing
	console.log("[application.signalling.sessionRTC.main()] - FATAL: Not able to load modules. Exiting.");
	console.error("[application.signalling.sessionRTC.main()] - FATAL: Not able to load modules. Exiting.");
	console.error(e.stack);
	process.exit(0);
}


//**********************************************************
//	PRIVATE PROPERTIES
//**********************************************************
var conversation;
var self=this;

//***********************************************************
//*                   PRIVATE METHODS
//**********************************************************/


//***********************************************************
//*                PUBLIC METHODS (getter / setter)
//**********************************************************/


/**************************************************
*<!--             SET CONVERSATION
*===============================================-->
*   Bind Session to a Conversation.
*
* @param  {inputConversation} Conversation to bind
* @see    application.signalling.conversation
**************************************************/
SessionRTC.prototype.setConversation= function(inputConversation) {
	try {
		if(typeof inputConversation != 'undefined') {
			conversation=inputConversation;
		} else {
			traza.print (Trazador.WARN, "application.signalling.conversation.sessionRTC.setConversation()", "Missing Input Argument.... inputConversation:[" + typeof inputConversation +"]");
			traza.print (Trazador.WARN, "application.signalling.conversation.sessionRTC.setConversation()", "Error linking current Session to a Conversation.");
		}

	} catch (e) {
		traza.print (Trazador.ERROR, "application.signalling.conversation.sessionRTC.setConversation()", "Error linking current Session to a Conversation. Unknown condition");
		traza.print (Trazador.ERROR, "application.signalling.conversation.sessionRTC.setConversation()", ".... inputListener:[" + typeof inputConversation + "]");
		traza.error(Trazador.ERROR, e);
	}
};


//***********************************************************
//*                PUBLIC METHODS
//**********************************************************/

SessionRTC.prototype.start= function(channel) {

	try {

		// 0.- Log entry
		traza.print (Trazador.DEBUG, "application.signalling.conversation.sessionRTC.start()", "SESSION RTC - Starting a Session.");



	} catch (e) {
		traza.print (Trazador.ERROR, "application.signalling.conversation.sessionRTC.start()", "Error starting session");
		traza.error(Trazador.ERROR, e);
	}


}

//***********************************************************
//*                       CONSTRUCTOR
//**********************************************************/

//------------------------------------------------
//				SET LOGGER
//			private setLogger()
//------------------------------------------------
//			Pointer to logger
//------------------------------------------------
function setLogger(logger) {
	try {
		if(typeof logger != 'undefined') {
			traza=logger;
		} else {
			if (traza==null) { traza=new Trazador();}
		}
	} catch (e) {
		console.log("[application.signalling.sessionRTC.setLogger()] - WARN: Unable to setup logger. Unknow Condition.");
		throw e;
	}
};


/**************************************************
*<!--             SESSION RTC
*===============================================-->
*   WebSocket Channel.
*   Package: application.signalling
*
* @constructor
* @param  logger Pointer to logger
* @see    application.signalling.conversation
**************************************************/
function SessionRTC(logger) {

	// 1.- Create new Object if already not launched
	if (!(this instanceof SessionRTC)) {
	  return new SessionRTC(logger);
	}

	// 2.- Point to logger
	setLogger(logger);

};
module.exports = SessionRTC;
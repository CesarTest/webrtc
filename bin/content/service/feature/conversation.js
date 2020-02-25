"use strict"
/************************************************************
 *<!--	              CONVERSATION.JS
 *========================================================-->
 *
 *     Observer of a user conversations, which consists on:
 *     1.- WsChannel... connection with memory, track states of the channel.
 *     2.- Session... track states of the user.
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
	var Trazador =  require('../../../utils/trazador');
	var WsChannel = require('./conversation/wschannel');
	var SessionRTC = require('./conversation/sessionrtc');

} catch (e) {

	// Logging System still not working, console printing
	console.log("[application.signalling.conversation.main()] - FATAL: Not able to load modules. Exiting.");
	console.error("[application.signalling.conversation.main()] - FATAL: Not able to load modules. Exiting.");
	console.error(e.stack);
	process.exit(0);
}

//***********************************************************
//*                  DEFAULT VALUES
//**********************************************************/


/**************************************************
*<!--              CONVERSATION
*===============================================-->
*   Observer of a WsChannel and a Session.
*   Package: application.signalling
*
* @constructor
* @param  logger Pointer to logger
* @see    application.signalling
**************************************************/
function Conversation(logger) {

	//**********************************************************
	//	PRIVATE PROPERTIES
	//**********************************************************
	// Self Pointer
	var self=this;

	// Logger pointer
	var traza;
	if(typeof logger != 'undefined') {self.traza=logger;}
	else {self.traza=new Trazador();}

	// Signalling Controller... the boss
	var signalling;

	// Conversation Components
	var wschannel;
	var sessionRTC;

	// Conversation Resources
	var socketPool;

	//***********************************************************
	//*                   PRIVATE METHODS
	//**********************************************************/

	//***********************************************************
	//*              PUBLIC METHODS (getter / setter)
	//**********************************************************/

	/**************************************************
	*<!--            GET WS CHANNEL
	*===============================================-->
	* @return  WS Channel associated with this conversation of the pool
	* @see     application.conversation.wschannel
	**************************************************/
	Conversation.prototype.getWsChannel = function getWsChannel(that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {
			return self.wschannel;
		} catch (e) {
			self.traza.print (self.traza.ERROR, "application.signalling.conversation.getWsChannel()", "Something misconfigure in the assignation.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	/**************************************************
	*<!--            GET SESSION RTC
	*===============================================-->
	* @return  HTML generator of the listener
	* @see     application.html
	**************************************************/
	Conversation.prototype.getSessionRTC = function getSessionRTC(that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {
			return self.sessionRTC;
		} catch (e) {
			self.traza.print (self.traza.ERROR, "application.signalling.conversation.getSessionRTC()", "Something misconfigure in the assignation.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	/**************************************************
	*<!--            GET SIGNALLING
	*===============================================-->
	* @return  Pointer to Signalling server
	* @see     application.signalling
	**************************************************/
	Conversation.prototype.getSignalling = function getSignalling(that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {
			return self.signalling;
		} catch (e) {
			self.traza.print (self.traza.ERROR, "application.signalling.conversation.getSignalling()", "Something misconfigure in the assignation.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//			 INIT WS CHANNEL
	//		private initWsChannel()
	//------------------------------------------------
	//   Object launcher.
	//------------------------------------------------
	Conversation.prototype.initWsChannel = function initWsChannel(that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {
			self.wschannel=new WsChannel(self.traza);
			self.wschannel.setConversation(self);
			self.wschannel.setSocketPool(self.socketPool)
			self.wschannel.init();

		} catch (e) {
			self.traza.print (self.traza.ERROR, "application.signalling.conversation.initWsChannel()",
					"Unable to initializate WsChannel object.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//			INIT SESSION RTC
	//		private initSessionRTC()
	//------------------------------------------------
	//
	//------------------------------------------------
	Conversation.prototype.initSessionRTC = function initSessionRTC(that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {
			self.sessionRTC=new SessionRTC(self.traza);
			self.sessionRTC.setConversation(self);

		} catch (e) {
			self.traza.print (self.traza.ERROR, "application.signalling.conversation.initSessionRTC()", "Unable to initializate SessionRTC object.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//------------------------------------------------
	//			INIT CONVERSATION
	//		private initConversation()
	//------------------------------------------------
	//	 Iniciate Conversation Bundle
	//------------------------------------------------
	Conversation.prototype.initConversation = function initConversation(that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {
			self.initWsChannel();
			//self.initSessionRTC();

		} catch (e) {
			self.traza.print (self.traza.ERROR, "application.signalling.conversation.initConversation()", "Starting a conversation.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	//***********************************************************
	//*                   PUBLIC METHODS
	//**********************************************************/

	/**************************************************
	*<!--                  INIT
	*===============================================-->
	*   Create a Pool of Conversations.
	*   Conversation keep track of:
	*
	*   <ol>
	*   	<li>Connection States, sort of memory for the channel behaviour.</li>
	*   	<li>Session States, sort of memory of user behaviour.</li>
	*   </ol>
	*
	* @param  server HTTP server object for piggyback attachment
	* @see    listener.server
	**************************************************/
	Conversation.prototype.init = function init(service,that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {

			// 0.- Log entry
			self.traza.print (self.traza.DEBUG, "application.signalling.conversation.init()",
				"CONVERSATION - Init: Create the pool conversations.");

			// 1.- Starting pool of connections
			self.socketPool=service.getSocketPool();
			self.initConversation();

			self.traza.print (self.traza.TRACE, "service.feature.conversation.init()",
					"CONVERSATION - Init: environment.", self);


		} catch (e) {
			self.traza.print (self.traza.ERROR, "application.signalling.conversation.createPool()", "CONVERSATION Init: Create the pool of conversations.");
			self.traza.error(self.traza.ERROR, e);
		}
	};

	/**************************************************
	*<!--               START
	*===============================================-->
	*   Connect the pool of conversations to a statelessChannel.
	*
	* @see    listener.server
	**************************************************/
	Conversation.prototype.start = function start(that) {

		// ------------ LOCAL ENVIRONMENT -----------
		// 1.- Setting 'self'
		var self; // WARN: must be var, not let... that means local to the entire function, not only loop
		if (typeof that!='undefined') {self=that;}
		if (self==null)               {self=this;}

		// ----------------- ACTIONS ----------------
		try {

			// 0.- Log entry
			self.traza.print (self.traza.DEBUG, "application.signalling.conversation.start()",
					"CONVERSATION - Conversation connected");
			self.wschannel.start();

		} catch (e) {
			self.traza.print (self.traza.ERROR, "application.signalling.conversation.connect()", "Starting a conversation.");
			self.traza.error(self.traza.ERROR, e);
		}
	};
};
module.exports = Conversation;
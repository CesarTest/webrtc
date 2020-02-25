/**
 * http://usejsdoc.org/
 */

// Adapter
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.mediaDevices.getUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

var SessionRTC = function(logger) {

	//***********************************************************
	//*                     PROPERTIES
	//**********************************************************/
 	// Private Properties
	var self=this;
	self.end_point=false;
	self.expectingSdpAnswer=true;

	// Browser properties
	var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
	var isFirefox = typeof InstallTrigger !== 'undefined';
	var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
	var isChrome = !!window.chrome && !isOpera;
	var isIE = /*@cc_on!@*/false || !!document.documentMode;
	var isEdge = !isIE && !!window.StyleMedia;

	// Local Media Properties
	self.localVideo;
	self.remoteVideo;
	self.localMediaOff=true;

	// Streams: Video/Audio
	self.localStream;  // Multimedia outbound
	self.remoteStream; // Multimedia inbound

	// Streams: Data
	self.dataStream;
	self.localDataStreamOptions = {
		  ordered: false, // do not guarantee order
		  maxRetransmitTime: 3000, // in milliseconds
	};


	// Peer Connection Properties
	self.peerConnection;
	self.peerConnectionConfig = {'iceServers': [{'urls': 'turn:turn101.dialoga.io', username: 'hello3119', credential:'svcIt.Qza319sUipzSK' }]};
	self.peerConnectionOptions = { 'optional': [{'DtlsSrtpKeyAgreement': true}, {'RtpDataChannels': true }] };
	self.constraints = {
					      'OfferToReceiveAudio': true
					    , 'OfferToReceiveVideo': true
					};

	/* mandatory: {
    	  'OfferToReceiveAudio': true
  		, 'OfferToReceiveVideo': true
	},*/

	// Data Channel Properties
	self.file; // file reader


	// Messages properties
	self.description; // What comes on SDP Messages

 	// Private Properties
 	/*var traza;
	if(typeof logger != 'undefined') {traza=logger;}
	else {traza=new Trazador();}
	*/


	//***********************************************************
	//*                     USER MEDIA
	//**********************************************************/
	//------------------------------------------------
	//			       DISPLAY STREAM
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.displayStream = function displayStream(container, stream) {
		try {
			// ... Just replace current one with the new one
			// ... That should be UI responsability
			console.log("sessionrtc.displayStream () - Display Stream", stream);
			container.src = window.URL.createObjectURL(stream);

		} catch (e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			       GET USER MEDIA
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.getUserMedia = function getUserMedia() {

		//------------ LOCAL ENVIRONMENT -------------
		var constraints;

		// ----------------- ACTIONS ----------------
		try {

			// 1.- Set Properties
			constraints = {
					video: true,
					audio: true,
			};

			// 2.- Log properties
			console.log("sessionrtc.getUserMedia() - Start Capturing Local Media. Constrains", constraints);

			// 3.- Start capture
			if(navigator.getUserMedia) {
				navigator.getUserMedia(constraints, self.getUserMediaSuccess, self.getUserMediaError);
			} else {
				alert('Your browser does not support getUserMedia API');
			}

		} catch(e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			   GET USER MEDIA SUCCESS
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.getUserMediaSuccess = function getUserMediaSuccess(stream) {
		try {

			// 1.- Set up Peer Connection
			//--------------
			if (self.peerConnection==null) {self.configurePeerConnection();}

			// 2.- Create Local Stream
			//--------------
			if ((typeof self.localStream=='undefined') || (self.localStream==null)) {
				self.localStream=new MediaStream(stream);
				// Missing State Machine of the Local Stream to control behaviour
			}

			// 3.- Add local stream to peer connection
			//-----------------------
			console.log("sessionrtc.getUserMediaSuccess() - adding Local Stream to Peer Connection", self.localStream);
			self.peerConnection.addStream(self.localStream);


			// 3.- Wait to get local stream ready
			//-----------------------
			//----- Trials
			//console.log("sessionrtc.getUserMediaSuccess() - Local Stream Status, Active?", self.localStream.active);
			/*while (!self.localStream.active) {
				setTimeout(function(){
					console.log('sessionrtc.getUserMediaSuccess() - Waiting to have the stream');
				}, 1000);
			}*/
			//----- Trials


			// 4.- Display Local Video
			//-----------------------
			self.displayStream(self.localVideo, self.localStream);

			// 5.- Generate Offer
			//    It should be once local media is attached to Peer Connection
			if(self.end_point==false) {self.generateSdpOffer();}
			if (self.expectingSdpAnswer) { 
				self.peerConnection.createAnswer(self.onSdpAnswerReady, self.onSdpAnswerError);
				self.expectingSdpAnswer=false;
			}

		} catch(e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			   GET USER MEDIA ERROR
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.getUserMediaError = function getUserMediaError(error) {
		console.log("sessionrtc.getMediaError() -  Local Media Capture Failed");
		console.log(error);
	}

	//***********************************************************
	//*                    SDP PROCESSING
	//**********************************************************/

	//------------------------------------------------
	//			     GENERATE SDP OFFER
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.generateSdpOffer = function generateSdpOffer() {


		// ----------------- ACTIONS ----------------
		try {

			// 1.- Log Entry
			//--------------
			console.log("sessionrtc.generateSdpOffer() - sdp", self.constraints);

			// 2.- Generate SDP Offer
			//----------------
			console.log("sessionrtc.generateSdpOffer() -Create SDP Offer.");
			self.peerConnection.createOffer(
					self.onSdpOfferReady,
					self.onSdpOfferError,
					self.constraints);

		} catch (e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			   GENERATE SDP ANSWER
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.generateSdpAnswer = function generateSdpAnswer(offer) {

		//------------ LOCAL ENVIRONMENT -------------

		// ----------------- ACTIONS ----------------
		try {

			// 1.- Log entry
			//---------------
			console.log("sessionrtc.generateSdpAnswer() - Incoming Offer", offer);

			// 2.- Set Remote Description
			//---------------
			self.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

			// 3.- Generate SDP Answer
			//----------------
			self.expectingSdpAnswer=true;
			if (self.localStream!=null) { 
				self.peerConnection.createAnswer(self.onSdpAnswerReady, self.onSdpAnswerError);
				self.expectingSdpAnswer=false;
			}

		} catch (e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			       PROCESS ANSWER
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.processSdpAnswer = function processSdpAnswer(answer) {

		// ----------------- ACTIONS ----------------
		try {

			// 1.- Log entry
			//---------------
			console.log('sessionrtc.processSdpAnswer() - We get an answer', answer);

			// 2.- Set Remote Description
			//---------------
			self.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

		} catch (e) {
			console.log(e);
		}
	};

 	//***********************************************************
	//*                     SDP EVENTS
	//**********************************************************/

	//------------------------------------------------
	//			        ON SDP OFFER READY
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.onSdpOfferReady = function onSdpOfferReady(description) {

		//------------ LOCAL ENVIRONMENT -------------
		var offer;

		// ----------------- ACTIONS ----------------
		try {

			// 1.- Capture Offer
			//--------------
			offer=description;

			// 2.- Set Local Description
			//--------------
			console.log("sessionrtc.onSdpOfferReady() - Set Local Description", offer);
			self.peerConnection.setLocalDescription(offer);

			// 3.- Send SDP Offer
			//--------------
			console.log("sessionrtc.onSdpOfferReady() - Send offer=", offer);
			self.wschannel.sendMessage('none', offer, self.properties, 'sdp');

		} catch (e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			   ON SDP ANSWER READY
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.onSdpAnswerReady = function onSdpAnswerReady(description) {

		//------------ LOCAL ENVIRONMENT -------------
		var answer;

		// ----------------- ACTIONS ----------------
		try {

			// 1.- Capture Answer
			//--------------
			answer=description;

			// 2.- Set Local Description
			//--------------
			console.log("sessionrtc.onSdpAnswerReady() - Set Local Description", answer);
			self.peerConnection.setLocalDescription(answer);

			// 3.- Send SDP Answer
			//--------------
			console.log("sessionrtc.onSdpAnswerReady() - Send Answer=", answer);
			self.wschannel.sendMessage('none', answer, self.properties, 'sdp');

		} catch (e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			    ON SDP OFFER ERROR
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.onSdpOfferError = function onSdpOfferError(error) {
		try {
			console.log("sessionrtc.onSdpOfferError() - Unable to generate SDP");
			console.log(error);

		} catch (e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			    ON SDP ANSWER ERROR
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.onSdpAnswerError = function onSdpAnswerError(error) {
		try {
			console.log("sessionrtc.onSdpAnswerError() - Unable to generate SDP");
			console.log(error);

		} catch (e) {
			console.log(e);
		}
	};

 	//***********************************************************
	//*                      ICE EVENTS
	//**********************************************************/

	//------------------------------------------------
	//			         ON ICE CANDIDATE
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.onIceCandidate = function onIceCandidate(event) {
		try {
			  if(event.candidate != null) {
				  console.log("sessionrtc.onIceCandidate() - Event:", event);
				  console.log("sessionrtc.onIceCandidate() - P2P:", self.properties);
				  self.wschannel.sendMessage('none',event.candidate, self.properties,'ice');
			  }
		} catch (e) {
			console.log(e);
		}
	};

 	//***********************************************************
	//*                    STREAM EVENTS
	//**********************************************************/

	//------------------------------------------------
	//			     ON LOCAL STREAM READY
	//------------------------------------------------
	//    Event: Fire when you actually have local streams
	//    Actions: Display local video into container
	//------------------------------------------------
	SessionRTC.prototype.onLocalStreamReady = function onLocalStreamReady() {
		try {
			if (self.localStream!=null) {
				self.displayStream(self.localVideo, self.localStream);
			} else {
				console.log("sessionrtc.onLocalStreamReady() - ERROR: self.localStream=", self.localStream);
			}

		} catch (e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			     ON LOCAL STREAM ATTACHED
	//------------------------------------------------
	//    Event: Fire when you successfully attach local media to PeerConnection
	//    Actions: Shoot the SDP offer
	//------------------------------------------------
	SessionRTC.prototype.onLocalStreamAttached = function onLocalStreamAttached() {
		try {
 			if(self.end_point==false) {self.generateSdpOffer();}

		} catch (e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			        ATTACH REMOTE TRACK
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.attachRemoteTrack = function attachRemoteTrack(track) {
		try {
			// 1.- Add track to Stream
			console.log("sessionrtc.attachRemoteTrack() - Add Track", track);
			self.remoteStream.addTrack(track);

		} catch (e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			        ON REMOTE STREAM
	//------------------------------------------------
	//    Event: Fire when you get remote track
	//    Actions: Display remote video into container
	//------------------------------------------------
	SessionRTC.prototype.onRemoteStream = function onRemoteStream(remote) {
		try {

			// 0.- Log Entry
			//--------------
			console.debug("sessionrtc.onRemoteStream() - got stream", remote);

			// 1.- Create Remote Stream
			//-------------------
			if ((typeof self.remoteStream=='undefined') || (self.remoteStream==null)) {
				self.remoteStream=new MediaStream(remote.stream);
			}

			// 2.- Add Stream (multiple stream supported by Chrome)
			//-------------------
			// Not implemented yet

			// 3.- Display Remote Stream on Container
			//-------------------
			self.displayStream(self.remoteVideo, self.remoteStream);


		} catch (e) {
			console.log(e);
		}
	};

	//------------------------------------------------
	//			        ON REMOTE TRACK
	//------------------------------------------------
	//    Event: Fire when you get remote track
	//    Actions: add track to stream, and display result
	//------------------------------------------------
	SessionRTC.prototype.onRemoteTrack = function onRemoteTrack(remote) {

		//------------ LOCAL ENVIRONMENT -------------
		var track_ids, current_id;

		// ----------------- ACTIONS ----------------
		try {

			// 0.- Log Entry
			//--------------
			console.log("---------------------------------------");
		    console.log("sessionrtc.onRemoteTrack() - got track", remote);

			// 1.- Create Remote Stream
			//-------------------
			if ((typeof self.remoteStream=='undefined') || (self.remoteStream==null)) {
				self.remoteStream=new MediaStream(remote.streams[0]);
				// Missing State Machine to control stream behaviour

			// 2.- Add track to stream
			//--------------------------
			} else {

				// 2.0.- Capture track IDs
				track_ids=self.remoteStream.getTracks().map( track => track.id );
				current_id=remote.track.id;
				console.log("sessionrtc.onRemoteTrack() - Tracks ID", track_ids);
				console.log("sessionrtc.onRemoteTrack() - Current ID", current_id);

				// 2.1.- Empty Stream... attach track
				if (typeof track_ids == 'undefined' ) {
					self.attachRemoteTrack(remote.track);

				// 2.2.- Current track don't exist in the Stream... attach track
				} else {
					if (track_ids.indexOf(current_id) == -1) {
						self.attachRemoteTrack(remote.track);
					}
				}
			}

			// 3.- Display Remote Stream on Container
			//-------------------
			self.displayStream(self.remoteVideo, self.remoteStream);

		} catch (e) {
			console.log(e);
		}
	};

 	//***********************************************************
	//*                   DATA-CHANNEL EVENTS
	//**********************************************************/

	//------------------------------------------------
	//		      ON REMOTE DATA CHANNEL
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.onRemoteDatachannel = function onRemoteDatachannel(event) {

		//------------ LOCAL ENVIRONMENT -------------

		// ----------------- ACTIONS ----------------
		try {

			// 0.- Log Entry
			//--------------
			console.log("sessionrtc.onRemoteDatachannel() - - DATACHANNEL... Event: Remote Datachannel",event);

			// 1.- Capture Remote Channel
			//--------------------
			self.dataStream=event.channel;

			// 2.- Set up Remote Channel State's Machine
			//-------------------
			self.configureDatachannel();

		} catch (e) {
			console.log ("sessionrtc.onRemoteDatachannel() - ERROR capturing remote data-channel");
			console.log(e);
		}
	};

	//------------------------------------------------
	//		      ON OPEN DATA CHANNEL
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.onOpenDatachannel = function onOpenDatachannel(event) {

		//------------ LOCAL ENVIRONMENT -------------
		var msj;

		// ----------------- ACTIONS ----------------
		try {
			console.log("sessionrtc.onOpenDatachannel() - - DATACHANNEL... Event: Open",event);
			msj='Welcome... isCaller=' + self.end_point;
			self.sendDatachannel(msj,'text');


		} catch (e) {
			console.log ("ERROR opening data-channel");
			console.log(e);
		}
	};

	//------------------------------------------------
	//		      ON CLOSE DATA CHANNEL
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.onCloseDatachannel = function onCloseDatachannel(event) {

		//------------ LOCAL ENVIRONMENT -------------

		// ----------------- ACTIONS ----------------
		try {
			console.log("sessionrtc.onCloseDatachannel() - - DATACHANNEL... Event: Close", event);

		} catch (e) {
			console.log ("ERROR closing data-channel");
			console.log(e);
		}
	};

	//------------------------------------------------
	//		      ON MESSAGE DATA CHANNEL
	//------------------------------------------------
	//  EVENT: Data stream is recieved.
	//    Here we don't have a continuous flow as multimedia
	//------------------------------------------------
	SessionRTC.prototype.onMessageDatachannel = function onMessageDatachannel(event) {

		//------------ LOCAL ENVIRONMENT -------------
		var tipo='none';
		var msj, evt;
		// ----------------- ACTIONS ----------------
		try {

			// 0.- Log entry
			//--------------
			console.log("sessionrtc.onMessageDatachannel() - DATACHANNEL... Event: Message", event.data);

			// 1.- Capture event data
			//--------------
			msj=JSON.parse(event.data);
			if(typeof msj.type != 'undefined') {tipo=msj.type;}

			// 2.- Treat event data
			//--------------
			switch (tipo) {
				case 'file':

					console.log("sessionrtc.onMessageDatachannel() - DATACHANNEL... File", msj);

					// 2.1.1.- Create File Object
					if (self.file==null) {
						self.file=new FileStream();
						self.file.init(self);
					}

					// 2.1.2.- Append stream to file
					self.file.save(msj);

					break;
				default:
					console.log("sessionrtc.onMessageDatachannel() - DATACHANNEL... Text", msj);
					newElement = $('<div></div>').text(msj.message);
					$('#private-messages').append(newElement);
					break;
			}


		   /*if (event.data.split(" ")[0] == "memoryFlipTile") {
					tileToFlip = event.data.split(" ")[1];
					displayMessage("Flipping tile " + tileToFlip);
					tile = document.querySelector("#" + tileToFlip);
					index = tileToFlip.split("_")[1];
					tile_value = memory_array[index];
					flipTheTile(tile,tile_value);
			} else if (event.data.split(" ")[0] == "newBoard") {
					displayMessage("Setting up new board");
					memory_array = event.data.split(" ")[1].split(",");
					//newBoard();
			}*/

		} catch (e) {
			console.log ("sessionrtc.onStreamDatachannel() - ERROR recieving data stream");
			console.log(e);
		}
	};

	//------------------------------------------------
	//		      ON ERROR DATA CHANNEL
	//------------------------------------------------
	//  EVENT: Data transfer Error in DataChannel
	//    Here we don't have a continuous flow as multimedia
	//------------------------------------------------
	SessionRTC.prototype.onErrorDatachannel = function onErrorDatachannel(error) {

		//------------ LOCAL ENVIRONMENT -------------

		// ----------------- ACTIONS ----------------
		try {
			console.log("sessionrtc.onErrorDatachannel() - DATACHANNEL... Event: Error", error);

		} catch (e) {
			console.log ("sessionrtc.onErrorDatachannel() - ERROR managing data transfer errors");
			console.log(e);
		}
	};

	//------------------------------------------------
	//		      ON BUFFERED  AMOUNT LOW
	//------------------------------------------------
	//  EVENT: Data transfer Error in DataChannel
	//    Here we don't have a continuous flow as multimedia
	//------------------------------------------------
	SessionRTC.prototype.onBufferedAmountLow = function onBufferedAmountLow() {

		//------------ LOCAL ENVIRONMENT -------------

		// ----------------- ACTIONS ----------------
		try {
			console.log("sessionrtc.onErrorDatachannel() - DATACHANNEL... Event: Error");

		} catch (e) {
			console.log ("sessionrtc.onErrorDatachannel() - ERROR managing data transfer errors");
			console.log(e);
		}
	};


 	//***********************************************************
	//*              ACTIONS: INITIALIZATION OF THE OBJECT
	//**********************************************************/

	//------------------------------------------------
	//		      CONFIGURE DATA CHANNEL
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.configureDatachannel = function configureDatachannel() {
		try {

			// 1.- Set State's Machine of the data stream
			//----------------------
			if (self.dataStream!=null) {
				self.dataStream.onopen             =self.onOpenDatachannel;
				self.dataStream.onclose            =self.onCloseDatachannel;
				self.dataStream.onmessage          =self.onMessageDatachannel;
				self.dataStream.onerror            =self.onErrorDatachannel;
				self.dataStream.onbufferedamountlow=self.onBufferedAmountLow;
			}

			// 2.- Dump Result
			//-----------------
			console.log("sessionrtc.configureDatachannel() : dataStream=", self.dataStream);

		} catch (e) {
			console.log ("sessionrtc.attachDataChannel() - ERROR configuring the channel");
			console.log(e);
		}
	};


	//------------------------------------------------
	//		      CREATE DATA_CHANNEL
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.createDatachannel = function createDatachannel() {
		try {

			if(self.peerConnection!=null) {

				// 1.- Create Data-Channel
				//---------------------
				if(self.dataStream==null) {
					self.dataStream=self.peerConnection.createDataChannel("data-transfer", self.dataStreamOptions);
				}

				// 2.- Configure Data-Channel
				//---------------------
				self.configureDatachannel();

				// 3.- Log Entry
				//-------------
				console.log("sessionrtc.createDataChannel() - DATACHANNEL... created successfully", self.dataStream);

			} else {
				console.log("sessionrtc.createDataChannel() - WARN, no peer connection established yet");
			}

		} catch (e) {
			console.log ("sessionrtc.createDataChannel() - ERROR creating the channel");
			console.log(e);
		}
	};
	//------------------------------------------------
	//		      CONFIGURE PEER CONNECTION
	//------------------------------------------------
	//------------------------------------------------
	SessionRTC.prototype.configurePeerConnection = function configurePeerConnection(createDatastream) {
		try {

			// 0.- Log entry
			//---------------
			console.log("sessionrtc.configurePeerConnection() : ICE servers=", self.peerConnectionConfig);
			console.log("sessionrtc.configurePeerConnection() : Options=", self.peerConnectionOptions);

			// 1.- Create Connection
			//----------------------
			self.peerConnection = new RTCPeerConnection(self.peerConnectionConfig);

			// 2.- Set State's Machine of the connection
			//----------------------
			self.peerConnection.onicecandidate = self.onIceCandidate;
			self.peerConnection.ondatachannel  = self.onRemoteDatachannel;

			// ... 2.1.- Old API
			self.peerConnection.onaddstream = self.onRemoteStream;
			//self.peerConnection.onremovestream=self.onRemoveRemoteStream;

			// ... 2.2.- New API
			self.peerConnection.onaddtrack  = self.onRemoteTrack;
			self.peerConnection.ontrack     = self.onRemoteTrack;
			//self.peerConnection.onremovetrack=self.onRemoveRemoteTrack ;

			// 3.- Create Data Channel
			//----------------
			if(typeof createDatastream != 'undefined') {
				if(createDatastream) {self.createDatachannel();}
			}

			// 4.- Dump Result
			//-----------------
			console.log("sessionrtc.configurePeerConnection() : peerConnection", self.peerConnection);

		} catch (e) {
			console.log ("ERROR configuring the channel");
			console.log(e);
		}
	};

 	//***********************************************************
	//*             CUSTOM OBJECT ACTIONS (public interface)
	//**********************************************************/

	/**
	*<!--               SEND DATA CHANNEL
	*===============================================-->
	*   External call when data channel should send something.
	*
	* @param {stream} Data Stream to send the other peer
	* @see    ui
	**************************************************/
	SessionRTC.prototype.sendDatachannel= function sendDatachannel(stream, type) {

		//------------ LOCAL ENVIRONMENT -------------
		var tipo='text';
		var msj;

		//----------------- ACTIONS ----------------
		try {


			// 1.- Type of object to be sent over data-channel
			//---------------------
			if(typeof type != 'undefined') {tipo=type};

			// 2.- Sending the object
			//--------------------
			if(self.dataStream!=null) {
				console.log("sessionrtc.sendDatachannel() - DATACHANNEL... Now Sending=", stream);
				console.log("sessionrtc.sendDatachannel() - DATACHANNEL... over channel=", self.dataStream);
				console.log("sessionrtc.sendDatachannel() - DATACHANNEL... tipo", tipo);
				switch (tipo) {

					// 2.1.- File Object
					case 'file':

						// 2.1.1.- Create File Object
						if (self.file==null) {
							self.file=new FileStream();
							self.file.init(self);
						}

						// 2.1.2.- Send file over datachannel
						console.log("sessionrtc.sendDatachannel() - DATACHANNEL... file", stream);
						self.file.send(stream);

						break;

					// 2.2.- Text Object
					default:
						msj= {
							 'type': 'text'
							, 'message': stream
						}
						self.dataStream.send(JSON.stringify(msj));
						break;
				}


			} else {
				console.log("sessionrtc.sendDatachannel() - DATACHANNEL... Still not established, unable to deliver");
			}

		} catch (e) {
			console.log(e);
		}
	};


	/**
	*<!--               CLOSE DATA CHANNEL
	*===============================================-->
	*   External call when data channel should be closed.
	*
	* @see    wschannel
	**************************************************/
	SessionRTC.prototype.closeDatachannel= function closeDatachannel() {

		//------------ LOCAL ENVIRONMENT -------------

		//----------------- ACTIONS ----------------
		try {
			console.log("sessionrtc.closeDatachannel() - DATACHANNEL... Now Closing");

		} catch (e) {
			console.log(e);
		}
	};


	/**
	*<!--               OPEN DATA CHANNEL
	*===============================================-->
	*   External call when data channel should be opened.
	*
	* @see    wschannel
	**************************************************/
	SessionRTC.prototype.openDatachannel= function openDatachannel(event) {

		//------------ LOCAL ENVIRONMENT -------------

		//----------------- ACTIONS ----------------
		try {

			// 0.- Log Entry
			//-------------
			console.log("sessionrtc.openDatachannel() - DATACHANNEL... Now Opening");

			// 1.- Create Peer Conection
			//-------------
			if(self.peerConnection!=null) {
				self.configurePeerConnection();
			}

			// 2.- Create the channel
			//---------------
			self.createDatachannel();

		} catch (e) {
			console.log(e);
		}
	};


	/**
	*<!--               PROCESS ICE
	*===============================================-->
	*   Called from WsChannel, due to the coupling.
	*   Therefore, public call.
	*
	* @see    wschannel
	**************************************************/
	SessionRTC.prototype.processIce= function processIce(ice) {

		//------------ LOCAL ENVIRONMENT -------------
		var candidate;

		// ----------------- ACTIONS ----------------
		try {
			candidate=new RTCIceCandidate(ice);
			self.peerConnection.addIceCandidate(candidate).then(_=>{
				  // Do stuff when the candidate is successfully passed to the ICE agent
				 console.log("SUCCESS: Candidate Passed to the handler");
				}).catch(e=>{
				  console.log("ERROR: Failure during addIceCandidate()");
				});


		} catch (e) {
			console.log(e);
		}
	};

	/**
	*<!--               PROCESS SDP
	*===============================================-->
	*   Called from WsChannel, due to the coupling.
	*   Therefore, public call.
	*
	* @see    wschannel
	**************************************************/
	SessionRTC.prototype.processSdp = function processSdp(message) {
		try {

			console.log('sessionrtc.processSdp() - sdp', message);
			switch (message.type) {
				case 'offer' :
					self.generateSdpAnswer(message);					
					break;
				case 'answer':
					self.processSdpAnswer(message);
					break;
			}

		} catch(e) {
			console.log(e);
		}
	};

 	//***********************************************************
	//*          STANDARD OBJECT ACTIONS (public interface)
	//**********************************************************/

	/**
	*<!--                 INIT
	*===============================================-->
	*   Init a RTC Session.
	*
	* @see    wschannel
	**************************************************/
	SessionRTC.prototype.init = function init (wschannel, localContainer, remoteContainer) {
		try {

			// 1.- Profile of properties of this object
			self.wschannel=wschannel;
			self.localVideo=localContainer;
			self.remoteVideo=remoteContainer;

			// 2.- Log Properties of the object
			console.log("sessionrtc.init() : localVideo", self.localVideo);
			console.log("sessionrtc.init() : remoteVideo", self.remoteVideo);


		} catch (e) {
			console.log(e);
		}
	};

	/**
	*<!--                 START
	*===============================================-->
	*   Start a RTC Session.
	*
	* @see    wschannel
	**************************************************/
	SessionRTC.prototype.start = function start(p2p, end) {

		// ----------------- ACTIONS ----------------
		try {

			// 0.- Log Entry
			//--------------
			console.log("sessionrtc.start() - Start Session RTC");

			// 1.- Set properties of the Session
			//--------------
			self.properties=p2p;
			if(typeof end != 'undefined') {self.end_point=end;}

			// 2.- Configure the Connection
			//-----------------------
			self.configurePeerConnection(self.end_point==false);
			//  - create Object
			//  - create data channel if caller (!end_point)
			//  - setStatesMachine
			//  (Should block until ready)

			// 3.- Get User Media
			//--------------
			if(self.localStream==null) {
				self.getUserMedia();
				// onMediaSuccess()...
				//       -attach local media (block until ready)
				//       -if (caller) {generateSdpOffer}

			// 4.- Media already captured
			//--------------
			//   - Shoot Offer
			// Check complete behaviour cycle to enable one direction peer connection
			} else {
				if(self.end_point==false) {self.sendSdpOffer();}
			}

		} catch (e) {
			console.log(e);
		}
	};

};
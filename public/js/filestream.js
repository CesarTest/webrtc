/**
 * http://usejsdoc.org/
 */
var FileStream = function(logger) {

	//***********************************************************
	//*                     PROPERTIES
	//**********************************************************/	
 	// 1.- Pointer to this process
	self=this;
    
	// 2.- Pointers
	self.reader;
	self.source;
	self.sessionRTC;
	
	// 3.- Buffer
	self.receiveBuffer = [];
	self.receivedSize = 0;	
	
	// 4.- Progress bar (that should be UI responsability)
	var progress = document.querySelector('.percent');	
	var downloadAnchor = document.querySelector('a#download');
	
	
	//***********************************************************
	//*                        TOOLS
	//**********************************************************/

	
	//***********************************************************
	//*                        EVENTS
	//**********************************************************/
	
	//------------------------------------------------
	//			          ON LOAD
	//------------------------------------------------               
	//------------------------------------------------		
	FileStream.prototype.onLoad = function onLoad (event) {
		var msj;
		
		try { 
			console.log("file.onLoad() - event=", event.target);	
			console.log("file.onLoad() - senf file on=", self.sessionRTC.dataStream);
			
			msj= {
					 'type': 'file'
					, 'name' : self.source.name
					, 'size' : self.source.size
					, 'message': event.target.result
			}
			
			self.sessionRTC.dataStream.send(JSON.stringify(msj));
		    progress.style.width = '100%';
		    progress.textContent = '100%';			
		} catch (e) {
			console.log(e);
		}		 
	};	
	
	//------------------------------------------------
	//			         ON LOAD START
	//------------------------------------------------               
	//------------------------------------------------		
	FileStream.prototype.onLoadStart = function onLoadStart (evt) {
		try { 
			console.log("file.onLoadStart() - event=", evt);
			
			//self.sessionRTC.dataStream.send(event.target);
		    document.getElementById('progress_bar').className = 'loading';
			
		} catch (e) {
			console.log(e);
		}		 
	};	
	
	//------------------------------------------------
	//			         ON PROGRESS
	//------------------------------------------------               
	//------------------------------------------------		
	FileStream.prototype.onProgress = function onProgress (evt) {
		try { 
			console.log("file.onProgress() - event=", evt);
		    if (evt.lengthComputable) {
		    	
		    	
		    	
		    	
		        var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
		        // Increase the progress bar length.
		        if (percentLoaded < 100) {
		          progress.style.width = percentLoaded + '%';
		          progress.textContent = percentLoaded + '%';
		        }
		      }
			
		} catch (e) {
			console.log(e);
		}		 
	};	
	
	//------------------------------------------------
	//			         ON ABORT
	//------------------------------------------------               
	//------------------------------------------------		
	FileStream.prototype.onAbort = function onAbort (event) {
		try { 
			alert('File read cancelled');
		} catch (e) {
			console.log(e);
		}		 
	};	
	
	//------------------------------------------------
	//			         ON ERROR
	//------------------------------------------------               
	//------------------------------------------------		
	FileStream.prototype.onError = function onError (evt) {
		try { 

			switch(evt.target.error.code) {
		      case evt.target.error.NOT_FOUND_ERR:
		        alert('File Not Found!');
		        break;
		      case evt.target.error.NOT_READABLE_ERR:
		        alert('File is not readable');
		        break;
		      case evt.target.error.ABORT_ERR:
		        break; // noop
		      default:
		        alert('An error occurred reading this file.');
		    };

		} catch (e) {
			console.log(e);
		}		 
	};
	
	//***********************************************************
	//*                        ACTIONS
	//**********************************************************/
	
	/**************************************************
	*<!--                 SAVE
	*===============================================-->
	*   Build file from the flow coming from datachannel.
	*   
	* @see    ui
	**************************************************/ 
	FileStream.prototype.save = function save(content) {
		
		try {
			console.log("file.save() - file=", content);
			self.receiveBuffer.push(content.message);
			self.receivedSize += content.message.length;
			console.log("file.save() - file=",content.message.length);
			console.log("file.save() - file=",self.receiveBuffer);
			
		  if (self.receivedSize === content.size) {
			    var received = new window.Blob(self.receiveBuffer);
			    self.receiveBuffer = [];
			    downloadAnchor.href='';
			    downloadAnchor.download='';
			    downloadAnchor.textContent='';
			    
			    downloadAnchor.href = URL.createObjectURL(received);
			    downloadAnchor.download = content.name;
			    downloadAnchor.textContent =
			      'Click to download \'' + content.name + '\' (' + content.size + ' bytes)';
			    downloadAnchor.style.display = 'block';
		  }			
			
		} catch (e) {
			console.log(e);
		}			
	};	
	
	/**************************************************
	*<!--                 SEND
	*===============================================-->
	*   Send file over datachannel.
	*   
	* @see    ui
	**************************************************/ 
	FileStream.prototype.send = function send(file) {
		try {
			
			console.log("file.send() - file=", file);
			self.source=file;
			self.reader.readAsBinaryString(file);
		} catch (e) {
			console.log(e);
		}			
	};
	
	//***********************************************************
	//*                    INITIALIZATIONS
	//**********************************************************/
	
	/**************************************************
	*<!--                 INIT
	*===============================================-->
	*   Create a Web Socket Channel.
	*   
	* @see    ui
	**************************************************/ 
	FileStream.prototype.init = function init (session) {
		try { 
			
			// 1.- Create Reader
			//------------------
			self.reader = new FileReader();	
			self.sessionRTC=session;
			
			// 2.- Set State's Machine
			//---------------------
			self.reader.onload      = self.onLoad;
			self.reader.onloadstart = self.onLoadStart;
			self.reader.onprogress  = self.onProgress;
			self.reader.onabort     = self.onAbort;
			self.reader.onerror     = self.onError;
			
		} catch (e) {
			console.log(e);
		}		 
	};
};
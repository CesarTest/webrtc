
# Video-Chat


## Architecture


###### Overview
+ Events are divided according to where they come from (sources). 
+ One process per source of events.
+ The client GUI is designed to explicitly show the elements of the architecture.
+ All processes follows same structure:

1.- **Public interfaces:** init(), start().

2.- **Responsabilities:** structured in actions / events.

		......... 2.1.- *Events:* interruption subroutines are always private.
		......... 2.2.- *Actions:* public and private functions. 
		......... 2.3.- *Helpers:* internal functions to avoid repetition of the code.

+ Scenarios involves several roles, therefore, is beyond the scope of a process structure.

###### Server Structure
1.- **HTML Server:** serving static contents  	
  This Server handle HTTP/HTTPS events (called Listener in the blueprints).
  
2.- **Signalling Server:** bringing HTML to life 
		This Server is controlling Pools: conversations and rooms... daemon behind the page. Unplug the room for other applications that do not require chat. Use types of conversations to establish different connections (such gaming, audio, video, etc)... this way same server can be reused for many scenarios... a complete testing lab. This general configuration of the system is handle by signalling process, as well as socket.io pool main events. Please, check server blueprints to see how interactivity is achieved 
		
		
		
	 2.1.- ROOM: Chat Container: over socket.io, connections are group according to rooms. 	Unplug this module in the signalling server if no chat is required.	
		......... 2.1.1.- Assign rooms to users  
		......... 2.1.2.- Handle room messages 	
		
 	 2.2.- CONVERSATION: over socket.io, p2p connections are handle by this observer. Unplug this module in the signalling server if no p2p connections are required. 
		 ......... 2.2.1.- Observer: conversations types, as well as handle main events (open/close) and failure recovery.    
		 ......... 2.2.2.- Inside Observer, Events are distributed in two roles:            
		                  2.2.2.1.- WsChannel: browser to server connection                 
		                  2.2.2.2.- SessionRTP: browser to browser connection               

###### Client Structure
+ **index.html**... static page + handle mappings
+ **ui.js**... controls user interface behaviour

Rest are mirror image of the server. 
UI process recieve events from the user, and from the internal logic. He should update the interface according to the events in his buffer.


## Usage

+ *Server:* from project folder, type 'ant'
+ *Client:* on a browsers, [http://172.26.76.43:4001](http://172.26.76.43:4001)

## Developing


### Tools

Created with [Nodeclipse](https://github.com/Nodeclipse/nodeclipse-1)
 ([Eclipse Marketplace](http://marketplace.eclipse.org/content/nodeclipse), [site](http://www.nodeclipse.org))   

Nodeclipse is free open-source project that grows with your contributions.

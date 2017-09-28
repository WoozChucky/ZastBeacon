/**
 * Zast Beacon
 *
 * Filename:   server.js
 * Author:     Nuno Silva (NB22477)
 * Date:       2017/09/26
 * Copyright (c) 2017 CityPulse
 */

var net = require('net');
var events = require('events');

/**
 * The GateServerSocket constructor
 * @constructor
 */
var GateServerSocket = function(){
	//socket initialization 
	this._address = '127.0.0.1';
	this._port = 27080;
	this._client = null;

	this._server = net.createServer( (socket) => {
		
			// Close Event
			socket.on('close', (error) => {
				this._client = null; // Clear the instance of client socket to allow a new connection
				console.log('[SERVER] Client disconnected');
			});
		
			// Timeout Event
			socket.on('timeout', () => {
				console.log('[SERVER] Client timeout');
				this._client = null;
			});
		
			socket.on('error', (error) => {
				console.log('[SERVER] Client error: ' + error.message);
				this._client = null;
			})
		
			// Message Received Event
			socket.on('data', (data) => {

				var parsedData = data.toString('utf8');
				console.log('[SERVER] Received -> ' + parsedData);
                
                socket.write('OK');
			});
		
		});
};

GateServerSocket.prototype = new events.EventEmitter;

/**
 * Fires up the Server Socket to start listening for connections.
 */
GateServerSocket.prototype.startListening = function() {
	// Start Listening
	this._server.listen(this._port, this._address);

	// Server accepting connections
	this._server.on('listening', () => {
		console.log('\x1b[31m%s\x1b[0m', '[SERVER] Server now listening on ' + this._address + ':' + this._port + '...\n');
	});

	// Client connection event
	this._server.on('connection', (socket) => {

		// Check if any previous client exists
		if(this._client == null) {
			//if it doesn't, allow it to proceed
			this._client = socket;
			console.log('[SERVER] Client ' + socket.remoteAddress + ":" + socket.remotePort +  ' connected');
			
			if (socket.remoteAddress != "127.0.0.1") { // This should never happen, but just because, verify it
				console.log('[SERVER] Client connecting from ' + socket.remoteAddress + ":" + socket.remotePort + ' was automatically disconnected.');
				socket.destroy();
			}
		} else {
			//if it does, destroy the connection
			console.log('[SERVER] Connected client from ' + this._client.remoteAddress + ":" + this._client.remotePort +
			 ' denied access from client ' + socket.remoteAddress + ":" + socket.remotePort + ' that was trying to connect...');
			socket.destroy();
		}
	});

	// Server error
	this._server.on('error', (error) => {
		console.log('[SERVER ] Error: ' + error.message);
	});
};

module.exports = GateServerSocket;
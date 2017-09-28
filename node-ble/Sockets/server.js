/**
 * Zast Beacon
 *
 * Filename:   server.js
 * Author:     Nuno Silva (NB22477)
 * Date:       2017/09/26
 * Copyright (c) 2017 CityPulse
 */

 /*jshint esversion: 6 */

var net = require('net');
var events = require('events');

/** 
 * Constant used to represent a socket client command that sets a new BluetoothConfiguration
 * @const {String}  
 * @description This is still under analysis, probably the TCP Message to be used by Client will be also used by the Server
 * */
const SET_CONFIGURATION_COMMAND = "SETCFG";
/** 
 * Constant used to represent a socket client command that requests the BluetoothConfiguration
 * @const {String}  
 * @description This is still under analysis, probably the TCP Message to be used by Client will be also used by the Server
 * */
const GET_CONFIGURATION_COMMAND = "GETCFG";

/**
 * The ZastServerSocket constructor
 * @constructor
 * @param {*SocketConfiguration.HOST} opts The SocketConfiguration.HOST parameters that contain the Address and Port of the Server Socket
 */
var ZastServerSocket = function(opts){
	//socket initialization 
	this._address = opts.ADDRESS;
	this._port = opts.PORT;
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
			});
		
			// Message Received Event
			socket.on('data', (data) => {

				var parsedData = data.toString('utf8').split('|');
				console.log('[SERVER] Received -> ' + parsedData);
				
				if(parsedData.length == 2) {
					if (parsedData[0] == SET_CONFIGURATION_COMMAND) {
						self.emit('onWriteConfigurationCommand', parsedData[1]);
					} else if (parsedData[0] == GET_CONFIGURATION_COMMAND) {
						self.emit('onReadConfigurationCommand');
					} else {
						socket.write('[SERVER] Command not recognized.');
					}
				} else {
					// for now, reply with request for debug purposes
					socket.write('[SERVER] Echoing back -> ' + data);
				}
			});
		
		});
};

ZastServerSocket.prototype = new events.EventEmitter();

/**
 * Fires up the Server Socket to start listening for connections.
 */
ZastServerSocket.prototype.startListening = function() {
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
			
			if (socket.remoteAddress != "127.0.0.1") { // This should never happen, but just cause verify it
				console.log('[SERVER] Client connecting from ' + socket.remoteAddress + ":" + socket.remotePort + ' was automatically disconnected.');
				socket.destroy();
			}
		} else {
			//if it does, destroy the connection
			console.log('[SERVER] Client connected from ' + this._client.remoteAddress + ":" + this._client.remotePort +
			 ' denied access from client ' + socket.remoteAddress + ":" + socket.remotePort + ' that was trying to connect...');
			socket.destroy();
		}
	});

	// Server error
	this._server.on('error', (error) => {
		console.log('[SERVER ] Error: ' + error.message);
	});
};

/**
 * Method used to reply to the connected socket client from an Event.
 * @param {Buffer} response The response buffer to be sent to client.
 */
ZastServerSocket.prototype.replyToClient = function(response) {

	if(this._client == null) {
		console.log('[SERVER] Client already disconnected, cant reply.');
		return;
	}
	// Send the response to the connected socket client
	this._client.write(response);
};

module.exports = ZastServerSocket;


/**
 * Zast Beacon
 *
 * Filename:   client.js
 * Author:     Nuno Silva (NB22477)
 * Date:       2017/09/26
 * Copyright (c) 2017 CityPulse
 */

 /* jshint esversion: 6 */

var net = require('net');
var EventEmitter = require('events').EventEmitter;
var utils = require('util');

var SocketConfiguration = require('./../Config/socket');        // JSON file with Socket configurations for TCP/IP
var Helper = require('./../helper');

var client = new net.Socket();		// The client socket
var connected = false;				// Flag to check the connection status with server
var beaconCallback = null;			// Bleno request callback method
var beaconValid = false;			// Bleno request 
var helper = new Helper();			// Helper class for message handling and I/O functions

/**
 * The ZastClientSocket module constructor.
 * @constructor
 */
var ZastClientSocket = function() {
	EventEmitter.call(this);
};

// Extends ZastClientSocket to EventEmitter
utils.inherits(ZastClientSocket, EventEmitter);

/**
 * This method connects to the Gate Controller TCP Server.
 * @param {function} callback The callback method that gets called when the connection was successfull.
 */
ZastClientSocket.prototype.connectToServer = (callback) => {	

	// Connect to Controller Server
	client.connect(SocketConfiguration.CLIENT.PORT, SocketConfiguration.CLIENT.ADDRESS, () => {
		console.log('[CLIENT] Conneted to ' + SocketConfiguration.CLIENT.ADDRESS + ":" + SocketConfiguration.CLIENT.PORT);
		connected = true;
		callback();
	});

	//Message received Event
	client.on('data', (data) => {
		console.log('[CLIENT] Received -> ' + data.toString('utf8'));
		var content = data.toString('utf8');

		helper.parseControllerResponse(content, (result, ignore) => {
			if (ignore) {
				// any result should be ignored if this flag is set. It is probably a ping response, so let's log it
				console.log('[CLIENT] Received ping response successfully, GateController is still alive.');
			} else {
				beaconCallback(result.Bytes, Buffer.from(result.Data, 'utf8'));
				beaconValid(result.Valid);
			}
		});
	});

	client.on('close', () => {
		console.log('[CLIENT] Connection to ' + this._address + ":" + this._port + ' was lost.');
		connected = false;
	});

	client.on('error', (error) => {
		console.log(error);
		connected = false;
	});
};

/**
 * This method send a "ping" message to the connected server making sure the connection is still alive.
 */
ZastClientSocket.prototype.keepAlive = function() {
	
	setInterval(() => {

		if (connected) {
			var message = helper.createStatusMessage();
			console.log('[CLIENT] Sending -> ' + message);

			var sent = client.write(message, () => {
				console.log('[CLIENT] Ping to ' + SocketConfiguration.CLIENT.ADDRESS + ":" + SocketConfiguration.CLIENT.PORT + ' was delivered successfully');
			});
			if(!sent){
				console.log('[CLIENT] Ping to ' + SocketConfiguration.CLIENT.ADDRESS + ":" + SocketConfiguration.CLIENT.PORT + ' couldnt be delivered.');
			}
		} else {
			console.log('[CLIENT] Not connected to server.');
		}

	}, 60000); // Run every 60 seconds
};

/**
 * This method parses the BLE message received, transforms it to our TCP message format and sends it to the GateController.
 * @param {string} 		data 		The BLE received message in utf8 format.
 * @param {function} 	callback	The BLE request callback
 * @param {boolean}		valid		The BLE request status
 */
ZastClientSocket.prototype.sendRequestToController = (data, callback, valid) => {
	if(connected) {
		
		// parse the ble message
		var userData = helper.parseCustomerValidationMessage(data);
		if(userData == null) {
			console.log('[CLIENT] Error parsing BLE received message.');
			callback(0x0e); // Writes the failure value to BLE callback
			valid(false);
			return;
		}

		// convert the message to our TCP format
		var message = helper.createCustomerValidationMessage(userData);
		
		// send the message
		var writtenToBuffer = client.write(message, () => {
			console.log('[CLIENT] Sent -> ' + message);
			beaconCallback = callback;	// save callback instance for prior execution
			beaconValid = valid;		// save status instance for prior update
		});

		//check if it was written to the kernel buffer
		if(!writtenToBuffer) {
			callback(0x0e); // Writes the failure value to BLE callback
			valid(false);
		}
	} else {
		console.log('[CLIENT] Cant send data, not connected.');
	}
};

module.exports = ZastClientSocket;
/**
 * Zast Beacon
 *
 * Filename:   zastcore.js
 * Author:     Nuno Silva (NB22477)
 * Date:       2017/09/26
 * Copyright (c) 2017 CityPulse
 */

  /*jshint esversion: 6 */

 var ZastServer = require('./Sockets/server');               // TCP/IP Server Socket used in communication with Bus/Gate Controller
 var ZastClient = require('./Sockets/client');               // TCP/IP Client Socket used in communication with Bus/Gate Controller
 var ZastBeacon = require('./zastbeacon');                   // Zast Beacon wrapper using Bleno library
 var SocketConfiguration = require('./Config/socket');       // JSON file with Socket configurations for TCP/IP
 var BluetoothConfiguration = require('./Config/bluetooth'); // JSON file with BLE configurations for Bleno
 var HelperModule = require('./helper');                     // Helper module that helps with File I/O methods

 var beacon = new ZastBeacon();
 var server = new ZastServer(SocketConfiguration.HOST);
 var client = new ZastClient();
 var helper = new HelperModule();

 /**
  * The ZastCore module constructor
  * @constructor
  */
 var ZastCore = function() { };

 /**
  * This methods start the TCP server and starts listening for connections from the Gate Controller Client
  */
 ZastCore.prototype.startServer = () => {

    // Init Server Socket
    server.startListening();

    // Write Configuration Event
    server.on('onWriteConfigurationCommand', (command) => {

    });

    // Read Configuration Event
    server.on('onReadConfigurationCommand', () => {

        var configuration = helper.readBluetoothConfiguration();
        
        var response = Buffer.from(JSON.stringify(configuration), 'utf8');

        server.replyToClient(response);
    });

 };

 /**
  * This method initializes the BLE packet Advertisement
  */
 ZastCore.prototype.startBeacon = () => {
    // Init Bluetooth module
    beacon.broadcast();

    beacon.on('onBusWrite', (data, callback, valid) => {
        //Send Request to Client Layer
        client.sendRequestToController(data, callback, valid);
    });

    beacon.on('onGateWrite', (data, callback, valid) => {
        //Send Request to Client Layer
        client.sendRequestToController(data, callback, valid);
    });

 };

 /**
  * This method starts the TCP Client that connects to the Gate Controller Server and keeps the connection alive by pinging every minute.
  */
 ZastCore.prototype.startClient = () => {
    client.connectToServer(() => {
        client.keepAlive();
    });
 };

 // exports the class
module.exports = ZastCore;
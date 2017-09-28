/**
 * Zast Beacon
 *
 * Filename:   zastbeacon.js
 * Author:     Nuno Silva (NB22477)
 * Date:       2017/09/26
 * Copyright (c) 2017 CityPulse
 */

 /*jshint esversion: 6 */

var BluetoothConfiguration = require('./Config/bluetooth');                 // JSON file with BLE configurations for Bleno

var Handshake = require('./Characteristics/handshake');                     // BLE Characteristic used in Authentication process
var Configure = require('./Characteristics/configure');                     // BLE Characteristic used in Configuration process
var Gate = require('./Characteristics/gate');                               // BLE Characteristic used in Gate opening process
var Bus = require('./Characteristics/bus');                                 // BLE Characteristic used in Bus validation process
var Test = require('./Characteristics/test');                               // BLE Characteristic used in Test process
var events = require('events');
var bleno = require('bleno');                                               // The default Bleno library
var HandshakeCharacteristic = new Handshake();
var ConfigureCharacteristic = new Configure(HandshakeCharacteristic);
var GateCharacteristic = new Gate(HandshakeCharacteristic);
var BusCharacteristic = new Bus(HandshakeCharacteristic);
var TestCharacteristic = new Test(HandshakeCharacteristic);

 /**
  * The ZastBeacon module constructor
  @constructor
  */
var ZastBeacon = function() { };

 ZastBeacon.prototype = new events.EventEmitter();

/**
 * This method starts the broadcasting of BLE advertisement packets
 */
 ZastBeacon.prototype.broadcast = function() {

    // Bluetooth Adapter Status Event
    bleno.on('stateChange', function(state) {
        console.log('[BLE] AdapterState: ' + state);
    
        if (state === 'poweredOn') {
            bleno.startAdvertising(BluetoothConfiguration.DEVICE_NAME, [BluetoothConfiguration.SERVICE_UUID]);
        } else {
            bleno.stopAdvertising();
        }
    }); 
  
    // Bluetooth Advertising Status Event
    bleno.on('advertisingStart', function(error) {
        console.log('[BLE] Advertising: ' + (error ? 'error ' + error : 'success'));
    
        var validCharacteristics = [];
    
        //Analyze mode to detect characteristics to use
        switch (BluetoothConfiguration.MODE) {
        case '0': // Awaiting Configuration
            validCharacteristics.push(HandshakeCharacteristic);
            validCharacteristics.push(ConfigureCharacteristic);
        break;
        case '1': // Gate Controller
            validCharacteristics.push(HandshakeCharacteristic);
            validCharacteristics.push(ConfigureCharacteristic);
            validCharacteristics.push(GateCharacteristic);
            validCharacteristics.push(TestCharacteristic);
        break;
        case '2': // Bus Controller
            validCharacteristics.push(HandshakeCharacteristic);
            validCharacteristics.push(ConfigureCharacteristic);
            validCharacteristics.push(BusCharacteristic);
            validCharacteristics.push(TestCharacteristic);
        break;
        default:
        break;
        }
    
        if (!error) {
        bleno.setServices([
            new bleno.PrimaryService({
            uuid: BluetoothConfiguration.SERVICE_UUID,
            characteristics: validCharacteristics
            })
        ]);
        }
    });
    
    // Bluetooth Client Connection Event
    bleno.on('accept', function(clientAddress) {
        console.log("[BLE] Accepted connection from address: " + clientAddress);
        bleno.updateRssi();
    });
    
    // Bluetooth Client Disconnect Event
    bleno.on('disconnect', function(clientAddress) {
        console.log("[BLE] Disconnected from address: " + clientAddress);
    });

    //Validate Characteristic Event
    BusCharacteristic.on('onWrite', (data, callback, valid) => {
        
        this.emit('onBusWrite', data, callback, valid); // Emit event to CoreLayer -> ClientSocket Layer

    });

    //Open Characteristic Event
    GateCharacteristic.on('onWrite', (data, callback, valid) => {
        
        this.emit('onGateWrite', data, callback, valid); // Emit event to CoreLayer -> ClientSocket Layer

    });

 };

 // export the class
 module.exports = ZastBeacon;
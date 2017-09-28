/**
 * Zast Beacon
 *
 * Filename:   helper.js
 * Author:     Nuno Silva (NB22477)
 * Date:       2017/09/26
 * Copyright (c) 2017 CityPulse
 */

 /*jshint esversion: 6 */


 //TODO(Nuno): All these variables and functions declared below that are outise the module, need refractoring

var MessageType = {
    InitialConfiguration : 'Z',
    RewriteConfiguration : 'R',
    CustomerValidationApp : 'V',
    CustomerValidationController : 'C',
    Status : 'S',
    ACK : 'A'
};

var ControllerMessageStructure = {
    STX : '<',
    Version : '',
    Type : '',
    CounterTransmited : '',
    Date : '',
    SenderType : '',
    DeviceId : '',
    DATA : '',
    ETX : '>'
};

var BLEMessageStructure = {
    STX : '<',
    Version : '',
    Type : '',
    CounterTransmited : '',
    Date : '',
    ProviderId : '',
    CustomerId : '',
    DATA : '',
    ETX : '>'
};

var InitialConfigurationStructure = {
    LineId : '',
    EndStationId : '',
    CurrentStationId : '',
    MessageHash : ''
};

var RewriteConfigurationStructure = {
    CurrentStationId : ''
};

var CustomerValidationAppStructure = {
    Date : ''
};

var CustomerValidationControllerStructure = {
    LineId : '',
    IO : '',
    EndStationId : '',
    ProductId : ''
};

var StatusStructure = {
    Hello : ''
};


function CreateStatus(STX, 
    Version,
    MessageType, 
    CounterTransmited, 
    Date, 
    Type, 
    DeviceId,
    Hello,
    ETX) {
        return STX + Version + ',' + MessageType + ',' + CounterTransmited + ',' + Date + ',' + Type + ',' + DeviceId + ',' + Hello + ETX;
}

function CreateCheckin(STX, 
    Version,
    MessageType, 
    CounterTransmited, 
    Date, 
    Type, 
    DeviceId, 
    LineId, 
    IO, 
    EndStationId, 
    ProductId, 
    CustomerId, 
    ETX) {
        return STX + Version + ',' + MessageType + ',' + CounterTransmited + ',' + Date + ',' + Type + ',' + DeviceId + ',' + LineId + ',' +
            IO + ',' + EndStationId + ',' + ProductId + ',' + CustomerId + ETX;
}

function random() {
    return Math.round(Math.random() * (1000 - 0) + 0);
}

function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}

/**
 * The Helper module constructor
 * @constructor
 */
var Helper = function() {
    this.crypto = require('crypto');                                        // Reserved for possible future use
    this.privateKey = 'wE4kDFMW6vsXUkv6Epmu';                               // Reserved for possible future use
    this.cipher = this.crypto.createCipher('aes192', this.privateKey);      // Reserved for possible future use
    this.decipher = this.crypto.createDecipher('aes192', this.privateKey);  // Reserved for possible future use

    this._fileSystem = require('fs');                                       // The FileSystem module used to write/read from configuration/log files
    this._buffer = new Buffer('');                                          // The Buffer used to write to the FileSystem
};

/**
 * @param {string} data The raw response from Gate Controller TCP
 * @param {function(object, boolean)} callback The callback from parsed data to be handled in ClientLayer
 */
Helper.prototype.parseControllerResponse = function(data, callback) {
    
    var parts = data.split(',');

    //Verify if data has standard delimiter
    if(parts.length == 0) {
        callback({
            Bytes : 0x0e,
            Valid : false,
            Data : 'INVALID MESSAGE FORMAT'
        }, false);
    }

    var version = parts[0].substr(1);
    // Verify if format of data is still valid
    if (!this.isVersionValid(version)) {
        callback({
            Bytes : 0x0e,
            Valid : false,
            Data : 'INVALID MESSAGE VERSION'
        }, false);
    }

    // Obtain the MessageType
    var messageType = parts[1];

    switch (messageType) { 
        //For now we're only checking the message type and ignoring the rest of the parameters until the Messaging protocol is closed.

        case MessageType.Status: // Ping
            callback({ }, true);
        break;
        case MessageType.CustomerValidationController: // Customer CheckIn
            callback({
                Bytes : 0x00,
                Valid : true,
                Data : 'OK'
            }, false);
        break;
        default:
            callback({
                Bytes : 0x0e,
                Valid : false,
                Data : 'INVALID MESSAGE TYPE'
            }, false);
        break;
    }
};

/**
 * This method parses the BLE request and converts it to a more readable format
 * @param {string} data The RAW ble request to be parsed
 * @description Not implemented, for now just return some random data
 * @return {JSON}
 */
Helper.prototype.parseCustomerValidationMessage = function(data) {
    return { 
        Counter     : ''+random(),
        Date        : '2017-09-27',
        DeviceId    : ''+guid(),
        ProductId   : ''+random(),
        CustomerId  : ''+random()
    };
};

/**
 * This method creates a CheckIn/CheckOut TCP Message ready to be sent.
 * @param {JSON} data The BLE request data already parsed
 * @return {JSON}
 */
Helper.prototype.createCustomerValidationMessage = function(data) {
    var bluetoothConfig = this.readBluetoothConfiguration();

    return CreateCheckin(ControllerMessageStructure.STX, bluetoothConfig.VERSION, MessageType.CustomerValidationController,
        data.Counter, data.Date, 'VVT', data.DeviceId, bluetoothConfig.LINE_ID, bluetoothConfig.IO, bluetoothConfig.END_STATION_ID,
        data.ProductId, data.CustomerId, ControllerMessageStructure.ETX);
};

/**
 * This method created a Ping TCP Message ready to be sent.
 * @return {JSON}
 */
Helper.prototype.createStatusMessage = function() {
    var bluetoothConfig = this.readBluetoothConfiguration();

    return CreateStatus(ControllerMessageStructure.STX, bluetoothConfig.VERSION, MessageType.Status, '0', 'Date', 'ZastBeacon',
        'NUM-SERIE-BEACON', 'Hi', ControllerMessageStructure.ETX);
};

/**
 * This method compares the version of the message received with the current message version
 * @param {string} version The version of the message
 * @return {boolean}
 */
Helper.prototype.isVersionValid = function(version) {
    var bluetoothConfig = this.readBluetoothConfiguration();
    return bluetoothConfig.VERSION == version;
};

/**
 * This method converts the string data passed to binary and writes it to the log's file asynchronously
 * @param {String} data The value to be converted and written
 */
Helper.prototype.writeLog = function(data) {

    this._buffer = new Buffer(data + '\n', 'binary');

    this._fileSystem.appendFile("logs.zast", this._buffer, function(err) {
        if(err) {
            console.log(err);
            return;
        }
        console.log("The log file was saved!");
    });
};

/**
 * This method 'calls' an application that turns ON a Raspberry PI 3 Model B GPIO pin 18 for 2 seconds, and turn if OFF.
 * @deprecated This method was previously used in to debug the Bluetooth funcionality. It used to blink a LED attached to it.
 */
Helper.prototype.blinkLED = function () {
    require('child_process').execFile('sudo', ['./GPIOBoard/board'], (err, stdout, stderr) => {
        if (err) throw err;
        console.log(stdout, stderr);
    });
};

/**
 * This method write the new bluetooth configuration in the disk asynchronously
 * @param {JSON} data The BluetoothConfiguration object to be serialized and saved.
 * @return Returns {Boolean} false/true in case of failure/success.
 */
Helper.prototype.writeBluetoothConfiguration = function(data) {
    var path = require('path').resolve(__dirname, 'Config/bluetooth.json');

    this._fileSystem.writeFile(path, JSON.stringify(data), function(err) {
        if(err) {
	        console.log(err);
            return false;
        } else {
	        console.log('BluetoothConfiguration data written successfully');
            return true; 
        }
    });
};

/**
 * This method reads the BluetoothConfiguration from disk (synchronously) and returns a JSON object of iftself.
 * @return {JSON} The BluetoothConfiguration or null.
 */
Helper.prototype.readBluetoothConfiguration = function() {

    var path = require('path').resolve(__dirname, 'Config/bluetooth.json');

    var content = this._fileSystem.readFileSync(path);
    if(content == null) {
        console.log('Content of config file was empty');
        return null;
    }
    return JSON.parse(content.toString('utf8'));
};

/**
 * This method creates a new BluetoothConfiguration based on the new data parameters passwd to it.
 * @param {String[]} data Contains the new values of the BluetoothConfiguration.
 * @return {JSON} The new BluetoothConfiguration object.
 */
Helper.prototype.createBluetoothConfiguration = function(data) {
    //TODO: Remove the hardcoded values below
    return {
            "DEVICE_NAME": Configuration.DEVICE_NAME,
            "MODE" : data[0],
            "SERVICE_UUID": Configuration.SERVICE_UUID,
            "AUTH_CHAR_UUID": Configuration.AUTH_CHAR_UUID,
            "GATE_UUID": Configuration.GATE_UUID,
            "BUS_UUID": Configuration.BUS_UUID,
            "TEST_UUID": Configuration.TEST_UUID,
            "CONFIGURE_UUID": Configuration.CONFIGURE_UUID,
            "OPERATOR_ID": data[1],
            "LINE_ID": data[2],
            "CURRENT_STATION_ID": data[3],
            "END_STATION_ID": Configuration.END_STATION_ID,
            "IO" : Configuration.IO,
            "VERSION" : Configuration.VERSION
        };
};

// export the class
module.exports = Helper;
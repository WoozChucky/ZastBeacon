var util = require('util');

var bleno = require('bleno');

var BlenoCharacteristic = bleno.Characteristic;

var Configuration = require('./../Config/bluetooth')  // JSON file with BLE configurations for Bleno

var BusCharacteristic = function(HandshakeCharacteristic) {
    BusCharacteristic.super_.call(this, {
        uuid: Configuration.BUS_UUID,
        properties: ['read', 'write'],
        value: null
    });
    this.HandshakeCharacteristic = HandshakeCharacteristic;
    this._value = new Buffer(0);
    this._valid = false;
};

util.inherits(BusCharacteristic, BlenoCharacteristic);

BusCharacteristic.prototype.onReadRequest = function(offset, callback) {
    if(!this.HandshakeCharacteristic.IsAuthenticated())
    {
        console.log('Client not Authenticated');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }

    console.log('BusCharacteristic - onReadRequest: value = ' + this._value.toString('utf-8'));
    if(this._valid == true)
    {
        var response = Buffer.from('OK', 'utf8');
        callback(this.RESULT_SUCCESS, response);
    }
    else {
        var response = Buffer.from('NOK', 'utf8');
        callback(this.RESULT_SUCCESS, response);
    }
    this._valid = false;
};

BusCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    this._value = data;

    if(!this.HandshakeCharacteristic.IsAuthenticated())
    {
        console.log('Client not Authenticated');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }

    console.log('BusCharacteristic - onWriteRequest: value = ' + this._value.toString('utf-8'));

    if(this._value == undefined || this._value == "")
    {
        console.log('Null user input');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }

    /* server.on('message', function (message, remote) {
        console.log(remote.address + ':' + remote.port +' - ' + message); */

	if(true) {
		Helper.Write(this._value);
		Helper.BlinkLED();
		this._valid = true;
		console.log("Success!");
    }
    
    callback(this.RESULT_SUCCESS);
};

module.exports = BusCharacteristic;
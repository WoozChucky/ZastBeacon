var util = require('util');

var bleno = require('bleno');

var BlenoCharacteristic = bleno.Characteristic;

var Configuration = require('./../Config/bluetooth')  // JSON file with BLE configurations for Bleno

var GateCharacteristic = function(HandshakeCharacteristic) {
    GateCharacteristic.super_.call(this, {
        uuid: Configuration.GATE_UUID,
        properties: ['read', 'write'],
        value: null
    });
    this.HandshakeCharacteristic = HandshakeCharacteristic;
    this._value = new Buffer(0);
    this._valid = false;
};

util.inherits(GateCharacteristic, BlenoCharacteristic);

GateCharacteristic.prototype.onReadRequest = function(offset, callback) {
    if(!this.HandshakeCharacteristic.IsAuthenticated())
    {
        console.log('[BLE] Device not Authenticated');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }

    console.log('[BLE] GateCharacteristic - onReadRequest: valid = ' + this._valid);
    if(this._valid)
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

GateCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    this._value = data;

    if(!this.HandshakeCharacteristic.IsAuthenticated())
    {
        console.log('[BLE] Device not Authenticated');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }

    console.log('[BLE] GateCharacteristic - onWriteRequest: value = ' + this._value.toString('utf-8'));

    if(this._value == undefined || this._value == "")
    {
        console.log('[BLE] Null user input');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }

    this.emit('onWrite', this._value.toString('utf-8'), callback, 
        (value) => {
            this._valid = value;
        }
    );
};

module.exports = GateCharacteristic;

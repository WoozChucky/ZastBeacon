var util = require('util');

var bleno = require('bleno');

var BlenoCharacteristic = bleno.Characteristic;

var Configuration = require('./../Config/bluetooth')  // JSON file with BLE configurations for Bleno

var TestCharacteristic = function(HandshakeCharacteristic) {
    TestCharacteristic.super_.call(this, {
        uuid: Configuration.TEST_UUID,
        properties: ['read'],
        value: null
    });
    this.HandshakeCharacteristic = HandshakeCharacteristic;
    this._value = new Buffer(0);
    this._valid = false;
};

util.inherits(TestCharacteristic, BlenoCharacteristic);

TestCharacteristic.prototype.onReadRequest = function(offset, callback) {
    if(!this.HandshakeCharacteristic.IsAuthenticated())
    {
        console.log('Client not Authenticated');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }

    console.log('TestCharacteristic - onReadRequest: value = ' + this._value.toString('utf-8'));
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


module.exports = TestCharacteristic;
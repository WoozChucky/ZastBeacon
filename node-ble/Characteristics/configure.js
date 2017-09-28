var util = require('util');
var bleno = require('bleno');

var Helper = require('./../helper');
var Configuration = require('./../Config/bluetooth')  // JSON file with BLE configurations for Bleno

var ConfigureCharacteristic = function(handshakeCharacteristic) {
    ConfigureCharacteristic.super_.call(this, {
      uuid: Configuration.CONFIGURE_UUID,
      properties: ['write', 'read'],
      value: null
    });
  this._value = new Buffer(0);
  this.HandshakeCharacteristic = handshakeCharacteristic;
  this._helper = new Helper();
};

util.inherits(ConfigureCharacteristic, bleno.Characteristic);

ConfigureCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {

    if(!this.HandshakeCharacteristic.IsAuthenticated())
    {
        console.log('Client not Authenticated');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }

    this._value = data;

    console.log('ConfigureCharacteristic - onWriteRequest: value = ' + this._value);

    //Command Format Example
    //<MODE,OPERATOR_ID,LINE_ID,END_STATION_ID>

    // Parse Configuration
    var newConfig = this._value.toString('utf8').split(',');
    console.log('New Configuration:\n' + newConfig);
    
    var finalConfig = this._helper.createBluetoothConfiguration(newConfig);
    console.log('Final Configuration:\n' + finalConfig);

    // Write configuration to disk
    var result = this._helper.writeBluetoothConfiguration(finalConfig);

    if(result) {
        process.exit(0);
    } else {
        callback(this.RESULT_UNLIKELY_ERROR, 0)
    }
};

ConfigureCharacteristic.prototype.onReadRequest = function(offset, callback) {
    
    if(!this.HandshakeCharacteristic.IsAuthenticated())
    {
        console.log('Client not Authenticated');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }

    console.log('ConfigureCharacteristic - onReadRequest');

    var configuration = this._helper.readBluetoothConfiguration();

    var response = Buffer.from(configuration);
    callback(this.RESULT_SUCCESS, response);

};

module.exports = ConfigureCharacteristic;
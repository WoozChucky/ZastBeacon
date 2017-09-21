var util = require('util');

var bleno = require('bleno');

var Configuration = require('./../Config/bluetooth')  // JSON file with BLE configurations for Bleno

var BlenoCharacteristic = bleno.Characteristic;

var ConfigureCharacteristic = function(handshakeCharacteristic) {
    ConfigureCharacteristic.super_.call(this, {
      uuid: Configuration.CONFIGURE_UUID,
      properties: ['write', 'read'],
      value: null
    });
  this._value = new Buffer(0);
  this.HandshakeCharacteristic = handshakeCharacteristic;
};

util.inherits(ConfigureCharacteristic, BlenoCharacteristic);

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
	console.log(newConfig);
    var finalConfig = {
	"DEVICE_NAME": Configuration.DEVICE_NAME,
        "MODE" : newConfig[0],
        "SERVICE_UUID": Configuration.SERVICE_UUID,
        "AUTH_CHAR_UUID": Configuration.AUTH_CHAR_UUID,
        "GATE_UUID": Configuration.GATE_UUID,
        "BUS_UUID": Configuration.BUS_UUID,
        "TEST_UUID": Configuration.TEST_UUID,
        "CONFIGURE_UUID": Configuration.CONFIGURE_UUID,
        "OPERATOR_ID": newConfig[1],
        "LINE_ID": newConfig[2],
        "STATION_ID": newConfig[3]
    };
console.log(finalConfig);

    require('fs').writeFile('./Config/bluetooth.json', JSON.stringify(finalConfig), function(err) {
        if(err) {
	console.log(err);
            callback(this.RESULT_UNLIKELY_ERROR, 0);
        } else {
	console.log('written data succsefully');
            callback(this.RESULT_SUCCESS);
	    process.exit(0);
        }
    });
};

ConfigureCharacteristic.prototype.onReadRequest = function(offset, callback) {
    
    if(!this.HandshakeCharacteristic.IsAuthenticated())
    {
        console.log('Client not Authenticated');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }

    console.log('ConfigureCharacteristic - onReadRequest');

    //TODO: Read configuration from JSON file and send it

    var response = Buffer.from('OK', 'utf8');
    callback(this.RESULT_SUCCESS, response);

};

module.exports = ConfigureCharacteristic;
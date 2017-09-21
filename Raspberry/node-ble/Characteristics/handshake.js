var util = require('util');

var bleno = require('bleno');

var BlenoCharacteristic = bleno.Characteristic;

var Configuration = require('./../Config/bluetooth')  // JSON file with BLE configurations for Bleno

var HandshakeCharacteristic = function() {
    HandshakeCharacteristic.super_.call(this, {
      uuid: Configuration.AUTH_CHAR_UUID,
      properties: ['write'],
      value: null
    });
  this._auth = false;
  this._value = new Buffer(0);
  this._firstCommand = true;

  this._day = 0;
  this._seconds = 0;
  this._miliseconds = 0;
};

util.inherits(HandshakeCharacteristic, BlenoCharacteristic);

HandshakeCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    this._value = data;

    console.log('HandshakeCharacteristic - onWriteRequest: value = ' + this._value);

    if(this._firstCommand) {
        // store day, seconds and miliseconds from date
	var unparsedDate = this._value.toString('utf8').split(',');
	console.log(unparsedDate);
        this._day = 1;
        this._seconds = unparsedDate[0];
        this._miliseconds = unparsedDate[1];
	console.log('Day -> ' + this._day);
	console.log('Seconds -> ' + this._seconds);
	console.log('Miliseconds -> ' + this._miliseconds);
        this._firstCommand = false;
        callback(this.RESULT_SUCCESS);
    } else {
        // test key received for a valid authentication
        var content = require('../Encryption/day' + this._day +'.json');
	var secret = content[this._seconds][this._miliseconds];
	console.log(secret);
        if (secret == this._value.toString('utf8')) {
            // Authenticated user
	    console.log('Auth OK');
            this._auth = true;
            callback(this.RESULT_SUCCESS);
        } else {
            // Authentication keys don't match
	    console.log('Auth NOK');
            callback(this.RESULT_UNLIKELY_ERROR, 0);
        }
    }
};

HandshakeCharacteristic.prototype.IsAuthenticated = function () {
	console.log('Requesting Auth -> ' + this._auth);
    return this._auth;
}

module.exports = HandshakeCharacteristic;
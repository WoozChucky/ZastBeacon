var util = require('util');

var bleno = require('bleno');

var BlenoCharacteristic = bleno.Characteristic;

var helper = require('./helper');
var Helper = new helper();

var LOGIN_KEY = Helper.Encrypt("LOGIN");

var HandshakeCharacteristic = function() {
    HandshakeCharacteristic.super_.call(this, {
      uuid: 'ec01',
      properties: ['write'],
      value: null
    });
  this._auth = false;
  this._value = new Buffer(0);
};

util.inherits(HandshakeCharacteristic, BlenoCharacteristic);

HandshakeCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    this._value = data;

    console.log('HandshakeCharacteristic - onWriteRequest: value = ' + this._value);
    var encryptedInput = Helper.Encrypt(this._value);

    if(encryptedInput == LOGIN_KEY)
    {
        console.log("AUTH is OK");
        this._auth = true;
    }

    callback(this.RESULT_SUCCESS);
};

HandshakeCharacteristic.prototype.IsAuthenticated = function () {
    return this._auth;
}

module.exports = HandshakeCharacteristic;
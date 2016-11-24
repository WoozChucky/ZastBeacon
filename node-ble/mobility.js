var util = require('util');

var bleno = require('bleno');

var BlenoCharacteristic = bleno.Characteristic;

var helper = require('./helper');
var Helper = new helper();

const CHECKIN = "CHECKIN";

var MobilityCharacteristic = function(HandshakeCharacteristic) {
    MobilityCharacteristic.super_.call(this, {
        uuid: 'ec02',
        properties: ['read', 'write'],
        value: null
    });
    this.HandshakeCharacteristic = HandshakeCharacteristic;
    this._value = new Buffer(0);
    this._valid = false;
};

util.inherits(MobilityCharacteristic, BlenoCharacteristic);

MobilityCharacteristic.prototype.onReadRequest = function(offset, callback) {
    if(!this.HandshakeCharacteristic.IsAuthenticated())
    {
        console.log('Client not Authenticated');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }

    console.log('MobilityCharacteristic - onReadRequest: value = ' + this._valid.toString('utf-8'));
    this.HandshakeCharacteristic._auth = false;
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

MobilityCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {
    this._value = data;

    if(!this.HandshakeCharacteristic.IsAuthenticated())
    {
        console.log('Client not Authenticated');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }

    //console.log('MobilityCharacteristic - onWriteRequest: value = ' + this._value.toString('utf-8'));

    if(this._value == undefined || this._value == "")
    {
        console.log('Null user input');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }

    var arrayOfStrings = this._value.toString('utf-8').split(' ');
    if(arrayOfStrings.length < 2)
    {
        console.log('Wrong argument number, expected CHECKIN <StationId>');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }

    if(arrayOfStrings[2] != CHECKIN)
    {
        console.log('Wrong argument, expected CHECKIN');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }

    if(Helper.DataExistsInFile(this._value))
    {
        console.log('Already exists in Logs.txt');
        callback(this.RESULT_UNLIKELY_ERROR, 0);
        return;
    }
    else
    {
        Helper.Write(this._value);
        Helper.BlinkLED();
        this._valid = true;
        console.log("Success!")
    }

    callback(this.RESULT_SUCCESS);
};

module.exports = MobilityCharacteristic;
var util = require('util');
var Struct = require('struct');
var bleno = require('bleno');
var dgram = require('dgram');

var BlenoCharacteristic = bleno.Characteristic;

var helper = require('./helper');
var Helper = new helper();

var PORT = 9010;
var HOST = '127.0.0.1';

var server = dgram.createSocket('udp4');

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

    server.on('message', function (message, remote) {
        console.log(remote.address + ':' + remote.port +' - ' + message);

	if(message == '0') {
		Helper.Write(this._value);
		Helper.BlinkLED();
		this._valid = true;
		console.log("Success!");
	}
    });

    var ZaBeaconCommand = Struct()
	.word32Sle('operationType')
	.word32Sle('checkinType')
	 .word32Sle('operatorId')
	.chars('deviceId',20)
        .chars('transactionDateTime',30)
	.chars('lineDirection',30)
	.chars('seatNumber',8);

	ZaBeaconCommand.allocate();

	ZaBeaconCommand.fields.operationType = 1;
	ZaBeaconCommand.fields.checkinType = 0;
	ZaBeaconCommand.fields.operatorId = 2;
	ZaBeaconCommand.fields.deviceId = 'Samsung Galaxy S3';
	ZaBeaconCommand.fields.transactionDateTime = '2017-06-21 18:42:35';
	ZaBeaconCommand.fields.lineDirection = 'Roma-Arreiro';
	ZaBeaconCommand.fields.seatNumber = 'B15';

	var message = ZaBeaconCommand.buffer();
    
    server.send(message, 0, message.length, 9000, '127.0.0.1', function (err, bytes) {
		if (err) throw err;
    		console.log('UDP message sent to ' + HOST +': 9000');	
	});

    callback(this.RESULT_SUCCESS);
};

server.bind(PORT, HOST);

module.exports = MobilityCharacteristic;

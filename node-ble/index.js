var bleno = require('bleno');

var BlenoPrimaryService = bleno.PrimaryService;

var Handshake = require('./handshake');
var Mobility = require('./mobility');

var HandshakeCharacteristic = new Handshake();
var MobilityCharacteristic = new Mobility(HandshakeCharacteristic);

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising('Mobility Beacon #1', ['ec00']);
  } else {
    bleno.stopAdvertising();
  }
}); 

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: 'ec00',
        characteristics: [
          HandshakeCharacteristic,
          MobilityCharacteristic
        ]
      })
    ]);
  }
});

bleno.on('accept', function(clientAddress) {
	console.log("Accepted connection from address: " + clientAddress);
    bleno.updateRssi();
});

bleno.on('disconnect', function(clientAddress) {
	console.log("Disconnect from address: " + clientAddress);
});
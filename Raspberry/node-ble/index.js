var bleno = require('bleno');                          // The default Bleno library

var BlenoPrimaryService = bleno.PrimaryService;

var Configuration = require('./Config/bluetooth.json')  // JSON file with BLE configurations for Bleno

var Handshake = require('./Characteristics/handshake'); // BLE Characteristic used in Authentication process
var Configure = require('./Characteristics/configure'); // BLE Characteristic used in Configuration process
var Gate = require('./Characteristics/gate');           // BLE Characteristic used in Gate opening process
var Bus = require('./Characteristics/bus');             // BLE Characteristic used in Bus validation process
var Test = require('./Characteristics/test');           // BLE Characteristic used in Test process

var HandshakeCharacteristic = new Handshake();
var ConfigureCharacteristic = new Configure(HandshakeCharacteristic);
var GateCharacteristic = new Gate(HandshakeCharacteristic);
var BusCharacteristic = new Bus(HandshakeCharacteristic);
var TestCharacteristic = new Test(HandshakeCharacteristic);

bleno.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
    bleno.startAdvertising(Configuration.DEVICE_NAME, [Configuration.SERVICE_UUID]);
  } else {
    bleno.stopAdvertising();
  }
}); 

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  var validCharacteristics = [];

  //Analyze mode to detect characteristics to use
  switch (Configuration.MODE) {
    case '0': // Awaiting Configuration
      validCharacteristics.push(HandshakeCharacteristic);
      validCharacteristics.push(ConfigureCharacteristic);
    break;
    case '1': // Gate Controller
      validCharacteristics.push(HandshakeCharacteristic);
      validCharacteristics.push(ConfigureCharacteristic);
      validCharacteristics.push(GateCharacteristic);
      validCharacteristics.push(TestCharacteristic);
    break;
    case '2': // Bus Controller
      validCharacteristics.push(HandshakeCharacteristic);
      validCharacteristics.push(ConfigureCharacteristic);
      validCharacteristics.push(BusCharacteristic);
      validCharacteristics.push(TestCharacteristic);
    break;
    default:
    break;
  }

  if (!error) {
    bleno.setServices([
      new BlenoPrimaryService({
        uuid: Configuration.SERVICE_UUID,
        characteristics: validCharacteristics
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
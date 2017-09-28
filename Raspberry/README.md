# ZastBeacon

 - TODO

# TODO LIST:

  - Refractoring
  - Write Tests
  - Implement older interface communications (ex. RS232)

### Tech

ZastBeacon one open source project to work properly:

* [Bleno] - A Node.js module for implementing BLE (Bluetooth Low Energy) peripheral.
 
### Folder Structure
* .vscode (Run/debug configurations for Visual Studio Code)
* node-ble (Application source)
* gate-controller (Simulator to test everything on the same machine)
* .install.sh (Installation script)

### Prerequisites
* Linux (Kernel Version 3.6 >=)
* [Node.js]
* [BlueZ] (Version 5.14 >=)

In the root folder of the repository there's a bash script that installs all prerequisites.
It has to be run with super user previleges.

```sh
$ sudo ./install.sh
```

This operation takes more or less 15 minutes, depending on your processor and internet speed.

### Installation

The application requires [Node.js](https://nodejs.org/) to run.
Although it was developed and tested on Node.js version 8, it should run on older versions aswell.

Install the dependencies and devDependencies and start the application.

```sh
$ cd node-ble
$ npm install -d
$ node start
```

For simulator environments...

```sh
$ cd gate-controller/
$ node app.js
$ cd ../node-ble
$ npm install -d
$ npm start
```

### Development

- TODO

### Licensing

- TODO

[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)


   [bleno]: <https://github.com/sandeepmistry/bleno>
   [node.js]: <http://nodejs.org>
   [NodeJS]: <http://nodejs.org>
   [BlueZ] : <http://www.bluez.org/>

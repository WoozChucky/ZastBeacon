/**
 * Zast Beacon
 *
 * Filename:   app.js
 * Author:     Nuno Silva (NB22477)
 * Date:       2017/09/26
 * Copyright (c) 2017 CityPulse
 */

 /*jshint esversion: 6 */

 // This is the main entry point of the application
 // The code below should be self-explanatory so no need for more comments.

var ZastCore = require('./zastcore');

var core = new ZastCore();

core.startBeacon();

core.startServer();

core.startClient();
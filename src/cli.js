#!/usr/bin/env node

global.log = require('./helpers/log');

var ProxyServer = require('./proxy');
var openBrowser = require('./proxy/openBrowser');

var server = new ProxyServer(5525);

server.start();
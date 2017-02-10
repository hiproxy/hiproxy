#!/usr/bin/env node

require('../src/helpers/color');
global.log = require('../src/helpers/log');

var Proxy = require('./../src/index');
// var openBrowser = require('./proxy/openBrowser');

var proxy = new Proxy(5525, 10011);

proxy.start().then(function(servers){
    console.log('-----------------------------------------');
    console.log('HTTP  _server: ', servers[0].address().port);
    if(servers[1]){
        console.log('HTTPS _server: ', servers[1].address().port);
    }
    console.log('-----------------------------------------');
})
#!/usr/bin/env node

require('../src/helpers/color');
var log = require('../src/helpers/log');
var cmd = require('../src/helpers/cmd');
var getLocalIP = require('../src/helpers/getLocalIP');

global.log = log;
global.cmd = cmd;

cmd.command('start', '启动代理服务', function(){
    var Proxy = require('./../src');
    // var openBrowser = require('./proxy/openBrowser');

    var proxy = new Proxy(this.port || 5525, this.middleManPort || 10010);

    proxy.start().then(function(servers){
        var proxyAddr = servers[0].address();
        var httpsAddr = servers[1] && servers[1].address();

        getLocalIP().then(function(ip){
            showImage([
                '',
                '',
                '    Proxy address: '.bold.green + (ip + ':' + proxyAddr.port).underline,
                '    Https address: '.bold.magenta + (httpsAddr ? (ip + ':' + httpsAddr.port).underline : 'disabled'),
                '    Proxy file at: '.bold.yellow + ('http://' + ip + ':' + proxyAddr.port + '/proxy.pac').underline,
                ''
            ]);
        })
    });
});

cmd
    .option('port', {
        alias: 'p',
        describe: '端口号'
    })
    .option('middle-man-port', {
        alias: 'm',
        describe: 'https中间人端口号'
    });

global.args = cmd.parse();

function showImage(lines){
    lines = lines || [];
    // console.log("  _     _                           ");
    // console.log(" | |   (_)                          ");
    // console.log(" | |__  _ _ __  _ __ _____  ___   _ ");
    // console.log(" | '_ \\| | '_ \\| '__/ _ \\ \\/ / | | |");
    // console.log(" | | | | | |_) | | | (_) >  <| |_| |");
    // console.log(" |_| |_|_| .__/|_|  \\___/_/\\_\\\\__, |");
    // console.log("         | |                   __/ |");
    // console.log("         |_|                  |___/ ");

    console.log('');
    console.log("  _     " + "_".bold.red + " ", lines[0] || '');
    console.log(" | |   " + "(_)".bold.red, lines[1] || '');
    console.log(" | |__  _ ", lines[2] || '');
    console.log(" | '_ \\| |", lines[3] || '');
    console.log(" | | | | |", lines[4] || '');
    console.log(" |_| |_|_|", lines[5] || '');
    console.log('');
}
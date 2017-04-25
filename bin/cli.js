#!/usr/bin/env node

require('colors');
// var color = require('../src/helpers/color');
var log = require('../src/helpers/log');
var Args = require('hemsl');
var getLocalIP = require('../src/helpers/getLocalIP');

var args = new Args();

global.log = log;

args.command('start', {
  describe: '启动代理服务',
  usage: 'start [--port <port>] [-xodD]',
  fn: startServer
})
.option('port <port>', {
  alias: 'p',
  describe: 'http代理服务端口号'
})
.option('https', {
  alias: 's',
  describe: '启动https代理服务'
})
.option('middle-man-port <port>', {
  alias: 'm',
  describe: 'https中间人端口号'
})
.option('open [browser]', {
  alias: 'o',
  describe: '打开浏览器窗口'
})
.option('pac-proxy', {
  describe: '是否使用自动代理，如果使用，不在hosts或者rewrite规则中的域名不会走代理'
});

args
    .version('1.0.6')
    .bin('hiproxy')
    .option('debug', {
      alias: 'd',
      describe: '显示调试信息'
    })
    .option('detail', {
      alias: 'D',
      describe: '显示详细调试信息'
    })
    .option('log-time', {
      describe: '显示日志时间'
    });

global.args = args.parse(true);

if (global.args._.length === 0 && Object.keys(global.args).length === 1) {
  showImage([
    '',
    '',
    'welcome to use hiproxy'.bold,
    'current version is ' + '1.0.6'.bold.green,
    'You can try `' + 'hiproxy --help'.underline + '` for more info'
  ]);
}

function showImage (lines) {
  lines = lines || [];
    // console.log("  _     _                           ");
    // console.log(" | |   (_)                          ");
    // console.log(" | |__  _ _ __  _ __ _____  ___   _ ");
    // console.log(" | '_ \\| | '_ \\| '__/ _ \\ \\/ / | | |");
    // console.log(" | | | | | |_) | | | (_) >  <| |_| |");
    // console.log(" |_| |_|_| .__/|_|  \\___/_/\\_\\\\__, |");
    // console.log("         | |                   __/ |");
    // console.log("         |_|                  |___/ ");

    // console.log('');
  console.log('  _     ' + '_'.bold.red + ' ', lines[0] || '');
  console.log(' | |   ' + '(_)'.bold.red, lines[1] || '');
  console.log(' | |__  _ ', lines[2] || '');
  console.log(" | '_ \\| |", lines[3] || '');
  console.log(' | | | | |', lines[4] || '');
  console.log(' |_| |_|_|', lines[5] || '');
  console.log('');
}

function startServer () {
  var Proxy = require('./../src/ProxyServer');
  var cliArgs = this;
  var https = cliArgs.https;
  var port = cliArgs.port || 5525;
  var httpsPort = https ? cliArgs.middleManPort || 10010 : 0;
  var proxy = new Proxy(port, httpsPort);

    // proxy.on('start', function(data){
    //     console.log('服务已经启动了：');
    //     console.log(data);
    // });

    // proxy.on('request', function(req, res){
    //     req.zdy = 'zdying';
    //     log.info('request event:::', req.method, req.url);
    // });

    // proxy.on('response', function(data){
    //     log.info('on response::::', data.toString());
    // })

  proxy.start().then(function (servers) {
    var proxyAddr = servers[0].address();
    var httpsAddr = servers[1] && servers[1].address();

    getLocalIP().then(function (ip) {
      showImage([
        '',
        '',
        '    Proxy address: '.bold.green + (ip + ':' + proxyAddr.port).underline,
        '    Https address: '.bold.magenta + (httpsAddr ? (ip + ':' + httpsAddr.port).underline : 'disabled'),
        '    Proxy file at: '.bold.yellow + ('http://' + ip + ':' + proxyAddr.port + '/proxy.pac').underline,
        ''
      ]);
    });

    var open = cliArgs.open;
    var browser = open === true ? 'chrome' : open;
    browser && proxy.openBrowser(browser, '127.0.0.1:' + port, cliArgs.pacProxy);

        // setTimeout(function(){
        //     console.log('停止服务');
        //     proxy.stop();
        // }, 10000);
        // setTimeout(function(){
        //     console.log('启动服务');
        //     proxy.start();
        // }, 20000)

        // setTimeout(function(){
        //     console.log('重启');
        //     proxy.restart();
        // }, 10000)
  });
}

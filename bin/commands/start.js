/**
 * @file command `start`
 * @author zdying
 */

'use strict';

var getLocalIP = require('../../src/helpers/getLocalIP');
var showImage = require('../showImage');

module.exports = {
  command: 'start',
  describe: 'Start a local proxy server',
  usage: 'start [--port <port>] [-xodD]',
  fn: startServer,
  options: {
    'port': {
      alias: 'p',
      validate: /^\d+$/,
      describe: 'server port'
    },
    'port <port>': {
      alias: 'p',
      describe: 'http代理服务端口号'
    },
    'https': {
      alias: 's',
      describe: '启动https代理服务'
    },
    'middle-man-port <port>': {
      alias: 'm',
      describe: 'https中间人端口号'
    },
    'open [browser]': {
      alias: 'o',
      describe: '打开浏览器窗口'
    },
    'pac-proxy': {
      describe: '是否使用自动代理，如果使用，不在hosts或者rewrite规则中的域名不会走代理'
    }
  }
};

function startServer () {
  var Proxy = require('../../src/ProxyServer');
  var cliArgs = this;
  var https = cliArgs.https;
  var port = cliArgs.port || 5525;
  var httpsPort = https ? cliArgs.middleManPort || 10010 : 0;
  var proxy = new Proxy(port, httpsPort);

  // proxy.on('start', function(data){
  //   console.log('服务已经启动了：');
  //   console.log(data);
  // });

  // proxy.on('request', function(req, res){
  //   req.zdy = 'zdying';
  //   log.info('request event:::', req.method, req.url);
  // });

  // proxy.on('response', function(data){
  //   log.info('on response::::', data.toString());
  // });

  proxy.start().then(function (servers) {
    var proxyAddr = servers[0].address();
    var httpsAddr = servers[1] && servers[1].address();

    getLocalIP().then(function (ip) {
      showImage([
        '',
        '',
        '  Proxy address: '.bold.green + (ip + ':' + proxyAddr.port).underline,
        '  Https address: '.bold.magenta + (httpsAddr ? (ip + ':' + httpsAddr.port).underline : 'disabled'),
        '  Proxy file at: '.bold.yellow + ('http://' + ip + ':' + proxyAddr.port + '/proxy.pac').underline,
        ''
      ]);
    });

    var open = cliArgs.open;
    var browser = open === true ? 'chrome' : open;
    browser && proxy.openBrowser(browser, '127.0.0.1:' + port, cliArgs.pacProxy);

    // setTimeout(function(){
    //   console.log('停止服务');
    //   proxy.stop();
    // }, 10000);
    // setTimeout(function(){
    //   console.log('启动服务');
    //   proxy.start();
    // }, 20000)

    // setTimeout(function(){
    //   console.log('重启');
    //   proxy.restart();
    // }, 10000)

    global.hiServer = proxy;
  });
}

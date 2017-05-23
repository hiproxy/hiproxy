/**
 * @file command `start`
 * @author zdying
 */

'use strict';

var fs = require('fs');
var path = require('path');
var homedir = require('os-homedir');

var getLocalIP = require('../../src/helpers/getLocalIP');
var showImage = require('../showImage');
var hiproxyDir = path.join(homedir(), '.hiproxy');

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

  // log format
  proxy.logger.on('data', function (level, msg) {
    var args = global.args;
    var logLevel = (args.logLevel || 'access,error').split(',');
    var grep = args.grep || '';

    if (logLevel.indexOf(level) !== -1 && msg.indexOf(grep) !== -1) {
      if (grep) {
        msg = msg.replace(new RegExp('(' + grep + ')', 'g'), grep.bold.magenta.underline);
      }
      console[level === 'error' ? 'error' : 'log'](('[' + level + ']').bold.red, msg);
    }
  });

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

    // write server info to file.
    writeServerInfoToFile();
  }).catch(function (err) {
    proxy.logger.error('Server start failed:', err.message);
    proxy.logger.detail(err.stack);
    process.exit(12);
  });
}

function writeServerInfoToFile () {
  // process pid
  var pid = fs.openSync(path.join(hiproxyDir, 'hiproxy.pid'), 'w');
  fs.write(pid, process.pid, function (err) {
    if (err) {
      console.log('pid write error');
    }
  });

  // cli argv
  var argsInfo = JSON.stringify({
    cmd: process.argv,
    args: global.args
  }, null, 4);
  var argsFile = fs.openSync(path.join(hiproxyDir, 'hiproxy.json'), 'w');
  fs.write(argsFile, argsInfo, function (err) {
    if (err) {
      console.log('hiproxy.json write error');
    }
  });
}

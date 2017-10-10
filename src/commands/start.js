/**
 * @file command `start`
 * @author zdying
 */

'use strict';

require('colors');

var fs = require('fs');
var path = require('path');
var homedir = require('os-homedir');

var checkServerStarted = require('../../src/helpers/checkServerStarted');
var mkdirp = require('../../src/helpers/mkdirp');
var getLocalIP = require('../../src/helpers/getLocalIP');
var showImage = require('../helpers/showImage');
var hiproxyDir = path.join(homedir(), '.hiproxy');

module.exports = {
  command: 'start',
  describe: 'Start a local proxy server',
  usage: 'start [--port <port>] [-xodD]',
  fn: startServer,
  options: {
    'port <port>': {
      alias: 'p',
      validate: /^\d+$/,
      describe: 'HTTP proxy port, default: 5525'
    },
    'daemon': {
      alias: 'D',
      describe: 'Run hiproxy in background'
    },
    'https': {
      alias: 's',
      describe: 'Enable HTTPS proxy'
    },
    'middle-man-port <port>': {
      alias: 'm',
      describe: 'The HTTPS proxy port, default: 10010'
    },
    'open [browser]': {
      alias: 'o',
      describe: 'Open a browser window and use hiproxy proxy'
    },
    'pac-proxy': {
      describe: 'Use ' + 'Proxy auto-configuration (PAC)'.underline
    },
    'sys-proxy <path>': {
      describe: 'Your own proxy server path, format: <ip>[:port], only works when use PAC'
    },
    'rewrite-file <files>': {
      alias: 'r',
      describe: 'rewrite'.underline + ' config files, format: <file1>[,<file2>[,...]]'
    },
    'hosts-file <files>': {
      alias: 'c',
      describe: 'hosts'.underline + ' files, format: <file1>[,<file2>[,...]]'
    },
    'workspace <dir>': {
      alias: 'w',
      describe: 'The workspace'
    }
  }
};

function startServer () {
  var self = this;
  if (!global.args.__error__) {
    checkServerStarted().then(function () {
      if (global.args.daemon && !process.env.__daemon) {
        _daemonServer();
      } else {
        _startServer(self);
      }
      // write server info to file.
      writeServerInfoToFile();
    }).catch(function (e) {
      console.log();
      console.log('hiproxy server start error:', e.message);
      console.log();
    });
  }
}
function _daemonServer () {
  // 如果指定后台运行模块，并且不是child进程，启动child进程
  var spawn = require('child_process').spawn;
  var logsDir = global.args.logDir || path.join(hiproxyDir, 'logs');

  mkdirp(logsDir);

  var env = process.env;
  var out = fs.openSync(path.join(logsDir, 'out.log'), 'a');
  var err = fs.openSync(path.join(logsDir, 'err.log'), 'a');
  var binPath = path.resolve(__filename, '../../cli.js');

  env.__daemon = true;

  var child = spawn('node', [binPath].concat(process.argv.slice(2)), {
    env: env,
    detached: true,
    stdio: ['ignore', out, err]
  });

  child.unref();
  console.log();
  console.log('The Hiproxy server is running in background.');
  console.log();
}

function _startServer (ctx) {
  var Proxy = require('../../src/');
  var cliArgs = ctx;
  var https = cliArgs.https;
  var port = cliArgs.port || 5525;
  var httpsPort = https ? cliArgs.middleManPort || 10010 : 0;

  var workspace = cliArgs.workspace || process.cwd();
  var proxy = new Proxy(port, httpsPort, workspace);

  process.stdout.write('\u001B[2J\u001B[0;0f');

  global.hiproxyServer = proxy;

  // log format
  proxy.logger.on('data', showLog);

  proxy.start(cliArgs).then(function (servers) {
    showStartedMessage(servers);

    var open = cliArgs.open;
    var browser = open === true ? 'chrome' : open;
    browser && proxy.openBrowser(browser, proxy.localIP + ':' + port, cliArgs.pacProxy);
  }).catch(function (err) {
    proxy.logger.error('Server start failed:', err.message);
    proxy.logger.detail(err.stack);
    process.exit(1);
  });
}

/**
 * 将服务信息写入到文件
 */
function writeServerInfoToFile () {
  // process pid
  var pid = fs.openSync(path.join(hiproxyDir, 'hiproxy.pid'), 'w');
  fs.write(pid, String(process.pid), function (err) {
    if (err) {
      console.log('pid write error');
    }
  });

  if (global.args.daemon) {
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
}

/**
 * 显示日志
 *
 * @param {String} level 日志级别
 * @param {String} msg   日志内容
 */
function showLog (level, msg) {
  var args = global.args;
  var logLevel = (args.logLevel || 'access,proxy').split(',');
  var grep = args.grep || '';
  var colorMap = {
    access: 'green',
    info: 'blue',
    warn: 'yellow',
    debug: 'magenta',
    detail: 'cyan',
    error: 'red',
    proxy: 'cyan'
  };
  var prefix = '';
  var color = '';
  var consoleMethod = '';

  if (logLevel.indexOf(level) !== -1 && msg.indexOf(grep) !== -1) {
    if (grep) {
      msg = msg.replace(new RegExp('(' + grep + ')', 'g'), grep.bold.magenta.underline);
    }

    prefix = '[' + level + ']';
    color = colorMap[level] || 'white';
    consoleMethod = level === 'error' ? 'error' : 'log';

    console[consoleMethod](prefix.bold[color], msg);
  }
}

/**
 * 服务启动后，显示服务信息
 *
 * @param {Array} servers 启动的服务
 */
function showStartedMessage (servers) {
  var proxyAddr = servers[0].address();
  var httpsAddr = servers[1] && servers[1].address();
  var workspace = global.args.workspace || process.cwd();

  return getLocalIP().then(function (ip) {
    showImage([
      '',
      '    Proxy address: '.bold.green + ('http://' + ip + ':' + proxyAddr.port).underline,
      '    Https address: '.bold.magenta + (httpsAddr ? ('https://' + ip + ':' + httpsAddr.port).underline : 'disabled'),
      '    Proxy file at: '.bold.yellow + ('http://' + ip + ':' + proxyAddr.port + '/proxy.pac').underline,
      '    SSL/TLS cert : '.bold.magenta + ('http://' + ip + ':' + proxyAddr.port + '/ssl-certificate').underline,
      '    Workspace at : '.bold.cyan + workspace.underline
    ]);
  });
}

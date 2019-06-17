/**
 * @file command `start`
 * @author zdying
 */

'use strict';

require('colors');

var fs = require('fs');
var path = require('path');

var checkServerStarted = require('../../src/helpers/checkServerStarted');
var mkdirp = require('../../src/helpers/mkdirp');
var dirtool = require('../helpers/dirTool');

var hiproxyDir = dirtool.getHiproxyDir();

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
    return checkServerStarted().then(function () {
      var server = null;
      if (global.args.daemon && !process.env.__daemon) {
        server = _daemonServer();
      } else {
        server = _startServer(self);
      }
      // write server info to file.
      writeServerInfoToFile();

      return server;
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
  var binPath = path.resolve(__filename, '../../bin/cli.js');

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
  var Proxy = require('../../src/server');
  var cliArgs = ctx;
  var https = cliArgs.https;
  var port = cliArgs.port || 5525;

  var httpsPort = https !== 'false' ? cliArgs.middleManPort || 10010 : 0;

  process.on('uncaughtException', function (err) {
    log.error('uncaughtException', err);
    log.detail(err.stack || err);
  });

  var workspace = cliArgs.workspace || process.cwd();
  var proxy = new Proxy({
    httpPort: port,
    httpsPort: httpsPort,
    dir: workspace,
    onBeforeRequest: function (detail) {
      // detail.proxy.method = 'POST';
    },
    onBeforeResponse: function (detail) {
      // var proxy = detail.proxy;
      var res = detail.res;
      var req = detail.req;
      var body = res.body;
      var headers = res.getHeaders();
      var contentType = headers['content-type'];

      if (this.isInternalRequest(req)) {
        return detail;
      }

      if (contentType && contentType.indexOf('text/html') !== -1) {
        // body += '<script>console.log("💻 Hacked by hiproxy `onBeforesResponse()` callback. 内容已经被hiproxy的`onBeforeResponse()`修改！")</script>';
      }
      // modify body
      res.body = body;
      // set header
      // not work
      res.headers['abc'] = 'def';
      // works
      res.setHeader('I-Love', 'hiproxy');

      return detail;
    },
    onData: function (detail) {
      // ...
    },
    onError: function (err, ctx) {
      var req = ctx.req;
      console.log('Bug：'.red, (req ? req.url : ''), err.message);
    }
  });

  // proxy.addCallback(
  //   'onBeforeRequest',
  //   function () {
  //     console.log('onBeforeRequest callback 1');
  //   },
  //   function () {
  //     console.log('onBeforeRequest callback 2');
  //   }
  // );

  // proxy.addCallback(
  //   'onBeforeRequest',
  //   function () {
  //     console.log('onBeforeRequest callback 3');
  //   },
  //   'dddd'
  // );

  // proxy.addCallback(
  //   'onBeforeResponse',
  //   function (detail) {
  //     detail.res.body += '<script>console.log("Hacked by another callback.");</script>';
  //   },
  //   function (detail) {
  //     detail.res.body += '<script>console.log("🌍🔗🐛");</script>';
  //   },
  // );

  process.stdout.write('\u001B[2J\u001B[0;0f');

  global.hiproxyServer = proxy;

  // log format
  proxy.logger.on('data', showLog);

  return proxy.start(cliArgs).then(function (servers) {
    proxy.showStartedMessage();

    var open = cliArgs.open;
    var browser = open === true ? 'chrome' : open;
    browser && proxy.openBrowser(browser, 'https://hi.proxy/', cliArgs.pacProxy);

    // proxy.addRule('rewrite', ['test.abc.com => {', '  location / {', '    echo "it works";', '  }', '}'].join('\n'));
    // proxy.addRule('hosts', ['127.0.0.1:8000 eight.hiproxy.org', '127.0.0.1 hiproxy.org'].join('\n'));
    return servers;
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
  var logLevel = getLevels();
  var grep = args.grep || '';
  var colorMap = {
    access: 'green',
    warn: 'yellow',
    debug: 'magenta',
    detail: 'blue',
    error: 'red',
    proxy: 'cyan'
  };
  var levelMap = {
    access: 'ACCES',
    warn: 'WARN!',
    debug: 'DEBUG',
    detail: 'DTAIL',
    error: 'ERROR',
    proxy: 'PROXY'
  };
  var prefix = '';
  var color = '';
  var consoleMethod = '';

  if (logLevel.indexOf(level) !== -1 && msg.indexOf(grep) !== -1) {
    if (grep) {
      msg = msg.replace(new RegExp('(' + grep + ')', 'g'), grep.bold.magenta.underline);
    }

    prefix = '[' + levelMap[level] + ']';
    color = colorMap[level] || 'white';
    consoleMethod = level === 'error' ? 'error' : 'log';

    console[consoleMethod](prefix.bold[color], msg);
  }
}

/**
 * Get global log levels config.
 */
function getLevels () {
  var args = global.args;

  if (!args.__log_levels) {
    let levels = ['access', 'proxy'];
    ['warn', 'error', 'debug', 'detail'].forEach(function (level) {
      if (args[level]) {
        levels.push(level);
      }
    });

    args.__log_levels = levels;
  }

  return args.__log_levels;
}

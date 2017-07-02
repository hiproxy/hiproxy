#!/usr/bin/env node

require('colors');
var path = require('path');
var fs = require('fs');
var homedir = require('os-homedir');

var Args = require('hemsl');
var showImage = require('./showImage');
var packageInfo = require('../package');
var pluginManager = require('../src/plugin');

// var directives = require('../src/commands');
// var routers = require('../src/listeners/request/hiproxyRouter');

var hiproxyDir = path.join(homedir(), '.hiproxy');
var _args = new Args();

// global.log = log;

'start stop restart state open'.split(' ').forEach(function (cmd) {
  var cmdConfig = require(path.join(__dirname, 'commands', cmd));

  if (cmdConfig && cmdConfig.command) {
    _args.command(cmdConfig);
  }
});

/* ============ load plugin ============ */
// var npmGlobalRoot = '/Users/zdy/.nvm/versions/node/v7.0.0/lib/node_modules';
// var testPlugin = path.join(npmGlobalRoot, 'hiproxy-plugin-test');
// var plugin = require(testPlugin);

// // console.log(plugin);

// // 添加Commands
// var commands = plugin.commands || [];
// commands.forEach(function (command) {
//   _args.command(command);
// });

// // 添加directives
// var customDirectives = plugin.directives || [];
// customDirectives.forEach(function (directive) {
//   directives.addDirective(directive);
// });

// // 添加router
// var routes = plugin.routes;

// routers.addRoute(routes);
/* ===================================== */

pluginManager.getInstalledPlugins().then(function (plugins) {
  if (plugins && plugins.length > 0) {
    pluginManager.loadPlugins(plugins, _args);
  }
  run();
}).catch(function () {
  run();
});

function run () {
  _args
    .version(packageInfo.version)
    .bin('hiproxy')
    // .option('debug', {
    //   alias: 'd',
    //   describe: '显示调试信息'
    // })
    // .option('detail', {
    //   alias: 'D',
    //   describe: '显示详细调试信息'
    // })
    .option('daemon', {
      alias: 'D',
      describe: '后台运行'
    })
    .option('log-dir <dir>', {
      describe: '后台运行时日志存放路径（绝对路径），默认为用户目录'
    })
    .option('log-time', {
      describe: '显示日志时间'
    })
    .option('log-level', {
      describe: '过滤日志级别，只有指定级别的日志才会显示',
      default: 'access,error'
    })
    .option('grep <content>', {
      describe: '过滤日志内容，只有保护过滤字符串的日志才会显示'
    });

  // 解析参数，但是不执行命令
  global.args = _args.parse(false);

  mkdirp(hiproxyDir);

  if (!global.args.__error__) {
    if (global.args.daemon && !process.env.__daemon) {
      // 如果指定后台运行模块，并且不是child进程，启动child进程
      var spawn = require('child_process').spawn;
      var logsDir = global.args.logDir || path.join(hiproxyDir, 'logs');

      mkdirp(logsDir);

      var env = process.env;
      var out = fs.openSync(path.join(logsDir, 'out.log'), 'a');
      var err = fs.openSync(path.join(logsDir, 'err.log'), 'a');

      env.__daemon = true;

      const child = spawn('node', [__filename].concat(process.argv.slice(2)), {
        env: env,
        detached: true,
        stdio: ['ignore', out, err]
      });

      child.unref();
    } else {
      // console.log('exe');
      // 没有指定后台运行，或者是child进程
      _args.execute();
    }

    if (global.args._.length === 0 && Object.keys(global.args).length === 1) {
      showImage([
        '',
        '',
        '   Welcome to use hiproxy'.bold,
        '   Current version is ' + packageInfo.version.bold.green,
        '   Try `' + 'hiproxy --help'.underline + '` for more info'
      ]);
    }
  }
}

function mkdirp (dir) {
  if (fs.existsSync(dir)) {
    return;
  }

  try {
    fs.mkdirSync(dir);
  } catch (err) {
    if (err.code === 'ENOENT') {
      mkdirp(path.dirname(dir));
      mkdirp(dir);
    }
  }
}

#!/usr/bin/env node

require('colors');
var path = require('path');
var homedir = require('os-homedir');
var hiproxy = require('../src/index');

var Args = require('hemsl');
var showImage = require('../src/helpers/showImage');
var packageInfo = require('../package');
var pluginManager = require('../src/plugin');

var mkdirp = require('../src/helpers/mkdirp');

var hiproxyDir = path.join(homedir(), '.hiproxy');
var _args = new Args({
  colors: {
    paragraph: 'white',
    title: 'white',
    command: 'white',
    parameter: 'white',
    option: 'white'
  }
});

global.hiproxy = hiproxy;

// global.log = log;

'init start stop restart state open'.split(' ').forEach(function (cmd) {
  var cmdConfig = require(path.join(__dirname, '..', 'src', 'commands', cmd));

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
    .option('debug', {
      describe: 'Show hiproxy debug log, label: [DEBUG]'
    })
    .option('detail', {
      describe: 'Show hiproxy detail debug log, label: [DTAIL]'
    })
    .option('error', {
      describe: 'Show hiproxy error log, label: [ERROR]'
    })
    .option('warn', {
      describe: 'Show hiproxy warning log, label: [WARN!]'
    })
    .option('log-dir <dir>', {
      describe: 'The log directory when run in background, default: user home directory'
    })
    .option('log-time', {
      describe: 'Show time info before every log message'
    })
    .option('grep <content>', {
      describe: 'Filter all the hiproxy log data'
    });

  // 解析参数，但是不执行命令
  global.args = _args.parse(false);

  mkdirp(hiproxyDir);

  _args.execute();

  if (!global.args.__error__ && global.args._.length === 0 && Object.keys(global.args).length === 1) {
    showImage([
      '',
      '',
      '   Welcome to use'.bold + (' hiproxy@' + packageInfo.version).bold.green,
      '   You can try `' + 'hiproxy --help'.cyan.underline + '` for more info',
      '   And the documentation site is ' + 'http://hiproxy.org/'.cyan.underline
    ]);
  }
}

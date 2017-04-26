#!/usr/bin/env node

require('colors');
var path = require('path');
// var color = require('../src/helpers/color');
var log = require('../src/helpers/log');
var Args = require('hemsl');
var showImage = require('./showImage');
var packageInfo = require('../package');

var _args = new Args();

global.log = log;

'start stop restart list open'.split(' ').forEach(function (cmd) {
  var cmdConfig = require(path.join(__dirname, 'commands', cmd));

  if (cmdConfig && cmdConfig.command) {
    _args.command(cmdConfig);
  }
});

_args
    .version(packageInfo.version)
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

// 解析参数，但是不执行命令
global.args = _args.parse(false);

if (global.args.daemon && !process.env.__daemon) {
  // 如果指定后台运行模块，并且不是child进程，启动child进程
  require('daemon')({
    env: process.env,
    stdout: process.stdout,
    stderr: process.stderr
  });
} else {
  // 没有指定后台运行，或者是child进程
  _args.execute();
}

if (global.args._.length === 0 && Object.keys(global.args).length === 1) {
  showImage([
    '',
    '',
    'welcome to use hiproxy'.bold,
    'current version is ' + '1.0.6'.bold.green,
    'You can try `' + 'hiproxy --help'.underline + '` for more info'
  ]);
}

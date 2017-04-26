#!/usr/bin/env node

require('colors');
var path = require('path');
// var color = require('../src/helpers/color');
var log = require('../src/helpers/log');
var Args = require('hemsl');
var showImage = require('./showImage');
var packageInfo = require('../package');

var args = new Args();

global.log = log;

'start stop restart list open'.split(' ').forEach(function (cmd) {
  var cmdConfig = require(path.join(__dirname, 'commands', cmd));

  if (cmdConfig && cmdConfig.command) {
    args.command(cmdConfig);
  }
});

args
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

#!/usr/bin/env node

require('colors');
var path = require('path');
// var color = require('../src/helpers/color');
// var log = require('../src/helpers/log');
var fs = require('fs');
var homedir = require('os-homedir');

var Args = require('hemsl');
var showImage = require('./showImage');
var packageInfo = require('../package');

var hiproxyDir = path.join(homedir(), '.hiproxy');
var _args = new Args();

// global.log = log;

'start stop restart state open'.split(' ').forEach(function (cmd) {
  var cmdConfig = require(path.join(__dirname, 'commands', cmd));

  if (cmdConfig && cmdConfig.command) {
    _args.command(cmdConfig);
  }
});

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
    .option('log-dir', {
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
      'welcome to use hiproxy'.bold,
      'current version is ' + packageInfo.version.bold.green,
      'You can try `' + 'hiproxy --help'.underline + '` for more info'
    ]);
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

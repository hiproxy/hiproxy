/**
 * @file command `list`
 * @author zdying
 */

'use strict';

var fs = require('fs');
var path = require('path');
var os = require('os');

var homedir = os.homedir();
var hiproxyDir = path.join(homedir, '.hiproxy');

var getLocalIP = require('../../src/helpers/getLocalIP');
var showImage = require('../showImage');

module.exports = {
  command: 'state',
  describe: 'Show all the servers state',
  usage: 'state [option]',
  fn: function () {
    var infoFile = fs.openSync(path.join(hiproxyDir, 'hiproxy.json'), 'r');
    // var pidFile = fs.openSync(path.join(hiproxyDir, 'hiproxy.pid'), 'r');

    // var pid = fs.readFileSync(pidFile);
    var info = fs.readFileSync(infoFile);

    var infoObj = JSON.parse(info);
    var port = infoObj.port || 5525;
    var args = infoObj.args;
    var httpsPort = args.https ? args.middleManPort || 10010 : '';
    // var tableData = {
    //   header: ['Service Name', 'Port', 'Address', 'State'],
    //   rows: [
    //     ['Proxy Server', port, 'http://127.0.0.1:' + port, 'Running'],
    //     ['HTTPS Server', httpsPort, 'http://127.0.0.1:' + httpsPort, 'Running'],
    //   ]
    // }

    // console.log(infoObj);

    getLocalIP().then(function (ip) {
      showImage([
        '',
        '',
        // '  Process (pid): ' + pid,
        '  Proxy address: '.bold.green + (ip + ':' + port).underline,
        '  Https address: '.bold.magenta + (httpsPort ? (ip + ':' + httpsPort).underline : 'disabled'),
        '  Proxy file at: '.bold.yellow + ('http://' + ip + ':' + port + '/proxy.pac').underline,
        ''
      ]);
    });

    // console.log(infoObj);

    // console.log('\ncoming soon...\n');
    // console.log();
    // console.log('Current http services:');
    // console.log();
    // console.log('  +---------------+--------+-------------------------+---------+');
    // console.log('  | Service Name  |  Port  |          Address        |  State  |');
    // console.log('  +---------------+--------+-------------------------+---------+');
    // console.log('  | Proxy Server  | 10010  | http://127.0.0.1:10010/ | Running |');
    // console.log('  | Https Server  | 443    | https://127.0.0.1/      | Stopped |');
    // console.log('  | Static Server | 80     | http://127.0.0.1/       | Stopped |');
    // console.log('  +---------------+--------+-------------------------+---------+');
    // console.log();
  },
  options: {
    'type': {
      default: 'service',
      alias: 'S'
    }
  }
};

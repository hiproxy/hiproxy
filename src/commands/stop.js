/**
 * @file command `reload`
 * @author zdying
 */

'use strict';

var fs = require('fs');
var path = require('path');
var dirtool = require('../helpers/dirTool');

module.exports = {
  command: 'stop',
  describe: 'Stop the local proxy server (Only works in daemon mode)',
  usage: 'stop',
  fn: function () {
    console.log();
    var hpdir = dirtool.getHiproxyDir();
    var pidFile = path.join(hpdir, 'hiproxy.pid');
    var hiproxyConfFile = path.join(hpdir, 'hiproxy.json');

    if (!fs.existsSync(hiproxyConfFile)) {
      console.log('[Error] Command <stop> will only work in daemon mode.');
      console.log();
    } else {
      fs.readFile(pidFile, 'utf-8', function (err, data) {
        if (err) {
          console.log('hiproxy.pid file read error:', err.message);
        } else if (data) {
          'hiproxy.pid hiproxy.json proxy.pac'.split(' ').forEach(function (fileName) {
            fs.unlinkSync(path.join(hpdir, fileName));
          });

          process.kill(Number(data), 'SIGHUP');
          console.log('Server stopped');
          console.log();
        } else {
          console.log('There is a hiproxy service running...');
        }
      });
    }
  }
};

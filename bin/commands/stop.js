/**
 * @file command `reload`
 * @author zdying
 */

'use strict';

var fs = require('fs');
var path = require('path');

var homedir = require('os-homedir');

module.exports = {
  command: 'stop',
  describe: 'Stop the local proxy server',
  usage: 'stop',
  fn: function () {
    console.log();
    var hpdir = path.join(homedir(), '.hiproxy');
    var pidFile = path.join(hpdir, 'hiproxy.pid');

    fs.readFile(pidFile, 'utf-8', function (err, data) {
      if (err) {
        console.log('hiproxy.pid file read error:', err.message);
      } else if (data) {
        'hiproxy.pid hiproxy.json proxy.pac'.split(' ').forEach(function (fileName) {
          fs.unlinkSync(path.join(hpdir, fileName));
        });

        process.kill(Number(data), 'SIGHUP');
        console.log('Server stopped');
      } else {
        console.log('There is hiproxy service is running...');
      }
      console.log();
    });
  }
};

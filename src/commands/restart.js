/**
 * @file command `reload`
 * @author zdying
 */

'use strict';

var path = require('path');
var childProcess = require('child_process');

var homedir = require('os-homedir');
var hiproxyDir = path.join(homedir(), '.hiproxy');

module.exports = {
  command: 'restart',
  describe: 'Restart the local proxy service (Only works in daemon mode)',
  usage: 'restart',
  fn: function () {
    try {
      var infoFile = path.join(hiproxyDir, 'hiproxy.json');
      var info = require(infoFile);
      var cmd = info.cmd;

      childProcess.execSync([cmd[0], cmd[1], 'stop'].join(' '));
      childProcess.execSync(cmd.join(' '), {maxBuffer: 5000 * 1024});

      console.log();
      console.log('Service reloaded success :)');
      console.log();
    } catch (err) {
      console.log();
      console.log('Service reloaded failed :(');
      console.log();
      console.log('[Error] Command <restart> will only work in daemon mode.');
      console.log();
    }
  }
};

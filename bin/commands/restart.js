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
  describe: 'Restart the local proxy service',
  usage: 'restart',
  fn: function () {
    try {
      var infoFile = path.join(hiproxyDir, 'hiproxy.json');
      var info = require(infoFile);
      var cmd = info.cmd;

      childProcess.execSync([cmd[0], cmd[1], 'stop'].join(' '));
      childProcess.execSync(cmd.join(' '));

      console.log();
      console.log('Service reloaded success :)');
      console.log();
    } catch (err) {
      console.log();
      console.log('Service reloaded failed :(');
      console.log('\nerror info: ', err.message);
      console.log();
    }
  }
};

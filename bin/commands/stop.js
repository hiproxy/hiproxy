/**
 * @file command `reload`
 * @author zdying
 */

'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');
var homedir = os.homedir();

var pidFile = path.join(homedir, '.hiproxy', 'hiproxy.pid');

module.exports = {
  command: 'stop',
  describe: 'Stop the local proxy server (In development)',
  usage: 'stop',
  fn: function () {
    console.log();
    fs.readFile(pidFile, 'utf-8', function (err, data) {
      if(err){
        console.log('hiproxy.pid file read error:', err.message);
      }else if(data){
        process.kill(Number(data), 'SIGHUP');
        fs.unlinkSync(pidFile);        
        console.log('Server stopped');
      }else{
        console.log('There is hiproxy service is running...');
      }
      console.log();
    });
  }
};

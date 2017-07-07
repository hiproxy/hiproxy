/**
 * @file command `list`
 * @author zdying
 */

'use strict';

var fs = require('fs');
var path = require('path');

var homedir = require('os-homedir');
var hiproxyDir = path.join(homedir(), '.hiproxy');

var getLocalIP = require('../../src/helpers/getLocalIP');
var showImage = require('../showImage');

module.exports = {
  command: 'state',
  describe: 'Show all the servers state',
  usage: 'state [option]',
  fn: function () {
    try {
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
          '    Proxy address: '.bold.green + (ip + ':' + port).underline,
          '    Https address: '.bold.magenta + (httpsPort ? (ip + ':' + httpsPort).underline : 'disabled'),
          '    Proxy file at: '.bold.yellow + ('http://' + ip + ':' + port + '/proxy.pac').underline,
          ''
        ]);
      });
    } catch (e) {
      console.log();
      console.log('No hiproxy is running.');
      console.log();
    }
  }
};

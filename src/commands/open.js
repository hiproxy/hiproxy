/**
 * @file command `open`
 * @author zdying
 */

'use strict';

var fs = require('fs');
var path = require('path');
var openBrowser = require('op-browser');

var dirtool = require('../helpers/dirTool');

var hiproxyDir = dirtool.getHiproxyDir();

module.exports = {
  command: 'open',
  describe: 'Open browser and set proxy',
  usage: 'open [options]',
  options: {
    'browser <browser>': {
      alias: 'b',
      validate: /^(chrome|firefox|opera)$/,
      describe: 'Browser name, default: chrome. Valid alues: chrome,firefox,opera'
    },
    'pac-proxy': {
      describe: 'Use Proxy auto-configuration (PAC)'
    }
  },
  fn: function () {
    var parsedArgs = this;

    try {
      var infoFile = fs.openSync(path.join(hiproxyDir, 'hiproxy.json'), 'r');
      var infoTxt = fs.readFileSync(infoFile);
      var info = JSON.parse(infoTxt);
      var args = info.args;
      var port = args.port || 5525;
      var proxyURL = 'http://127.0.0.1:' + port;

      if (parsedArgs.pacProxy) {
        openBrowser.open(parsedArgs.browser || 'chrome', proxyURL, '', proxyURL + '/proxy.pac');
      } else {
        openBrowser.open(parsedArgs.browser || 'chrome', proxyURL, proxyURL, '');
      }

      console.log('Browser opened');
    } catch (err) {
      console.log('Proxy server info read error.');
    }
  }
};

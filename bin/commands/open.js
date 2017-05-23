/**
 * @file command `open`
 * @author zdying
 */

'use strict';

var fs = require('fs');
var path = require('path');
var homedir = require('os-homedir');
var browser = require('../../src/browser');

var hiproxyDir = path.join(homedir(), '.hiproxy');

module.exports = {
  command: 'open',
  describe: 'Open browser and set proxy',
  usage: 'open [option]',
  options: {
    'browser <browser>': {
      alias: 'b',
      validate: /^(chrome|firefox|opera)$/,
      describe: '浏览器名称，默认：chrome，可选值：chrome,firefox,opera'
    },
    'pac-proxy': {
      describe: '是否使用自动代理，如果使用，不在hosts或者rewrite规则中的域名不会走代理'
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

      browser.open(parsedArgs.browser || 'chrome', 'http://127.0.0.1:' + port, port, parsedArgs.pacProxy);

      console.log('Browser opened');
    } catch (err) {
      console.log('Proxy server info read error.');
    }
  }
};

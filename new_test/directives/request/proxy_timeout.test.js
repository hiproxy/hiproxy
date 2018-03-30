var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - proxy_timeout', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'rewrite');
  var proxyInfo = null;

  before(function () {
    testServer.listen(6789);
    proxyServer = new Proxy({
      httpPort: 8848,
      onBeforeRequest: function (detail) {
        var proxy = detail.proxy;
        proxyInfo = proxy;
      }
    });
    global.log = proxyServer.logger;

    proxyServer.addRewriteFile(rewriteFile);
    proxyServer.start();
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  it('should set request header and send to remote server', function () {
    return request({
      uri: 'http://hiproxy.org/tiemout/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      assert.equal(2889, proxyInfo.timeout);
    });
  });

  it('should discard the invalid value', function () {
    return request({
      uri: 'http://hiproxy.org/tiemout_invalid/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      assert.equal(undefined, proxyInfo.timeout);
    });
  });
});

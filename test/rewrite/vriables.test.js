var path = require('path');
var assert = require('assert');
var hiproxy = require('../../src/');
var Proxy = hiproxy.Server;
var testServer = require('../testServer');
var request = require('../request');

describe('#rewrite - variables', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'rewrite_variables');

  before(function () {
    testServer.listen(6789);
    proxyServer = new Proxy(8848);
    global.log = proxyServer.logger;

    proxyServer.addRewriteFile(rewriteFile);
    proxyServer.start();
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  it('should send GET request to the remote server', function () {
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;

      assert.equal('hiproxy.org', body.host);
    });
  });
});

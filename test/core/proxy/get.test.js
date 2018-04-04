var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#proxy - proxy GET request', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'rewrite');

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
      assert.equal('GET', body.method);
    });
  });

  it('should send the original query string to the remote server', function () {
    return request({
      uri: 'http://hiproxy.org/?from=test&env=TEST',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;

      assert.equal('test', body.query.from);
      assert.equal('TEST', body.query.env);
    });
  });
});

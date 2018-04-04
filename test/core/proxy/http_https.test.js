var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#proxy - HTTPS request proxy', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'rewrite');

  before(function () {
    testServer.listen(6789);
    testServer.listenHTTPS(1234);
    proxyServer = new Proxy(8848, 1111);
    global.log = proxyServer.logger;

    proxyServer.addRewriteFile(rewriteFile);
    proxyServer.start();
  });

  after(function () {
    testServer.close();
    testServer.closeHTTPS();
    proxyServer.stop();
  });

  it('should proxy HTTP request to HTTPS server works', function () {
    return request({
      uri: 'http://hiproxy.org/2https/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      strictSSL: false
    }).then(function (res) {
      var body = res.body;

      assert.equal('https', body.serverType);
      assert.equal('/', body.url);
      assert.equal('GET', body.method);
    });
  });

  it('should proxy HTTPS request to HTTP server', function () {
    return request({
      uri: 'https://hiproxy.org/2http/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      strictSSL: false
    }).then(function (res) {
      var body = res.body;

      assert.equal('http', body.serverType);
      assert.equal('/', body.url);
      assert.equal('GET', body.method);
    });
  });

  it('should proxy HTTPS request to HTTPS server', function () {
    return request({
      uri: 'https://hiproxy.org/2https/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      strictSSL: false
    }).then(function (res) {
      var body = res.body;

      assert.equal('https', body.serverType);
      assert.equal('/', body.url);
      assert.equal('GET', body.method);
    });
  });

  it('should proxy HTTP request to HTTP server', function () {
    return request({
      uri: 'http://hiproxy.org/2http/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;

      assert.equal('http', body.serverType);
      assert.equal('/', body.url);
      assert.equal('GET', body.method);
    });
  });
});

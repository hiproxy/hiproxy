var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - proxy_set_header', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'headers.rewrite');
  var originalReq = {};

  before(function () {
    testServer.listen(6789);
    proxyServer = new Proxy(8848);
    global.log = proxyServer.logger;

    proxyServer.addRewriteFile(rewriteFile);
    proxyServer.start();

    proxyServer.on('response', function (data) {
      var req = data.req;
      originalReq = req.originalInfo;
    });
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  it('should set the original request headers to the `req.originReq` object', function () {
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        'key-1': 'val1',
        'key-2': 'val2'
      }
    }).then(function (res) {
      var headers = originalReq.headers;

      assert.equal('val1', headers['key-1']);
      assert.equal('val2', headers['key-2']);
    });
  });

  it('should NOT set the directive modified request headers to the `req.originReq` object', function () {
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        'key-1': 'val1',
        'key-2': 'val2'
      }
    }).then(function (res) {
      var headers = originalReq.headers;

      assert.equal(undefined, headers.from);
      assert.equal(undefined, headers.date);
    });
  });

  it('should send all the headers to the server', function () {
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        'key-1': 'val1',
        'key-2': 'val2'
      }
    }).then(function (res) {
      var headers = res.body.headers;

      assert.equal('Test_Case', headers.from);
      assert.equal('2018-03-30', headers.date);
      assert.equal('val1', headers['key-1']);
      assert.equal('val2', headers['key-2']);
    });
  });

  it('should set the original request info to the `req.originReq` object', function () {
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      assert.equal('http://hiproxy.org/', originalReq.url);
      assert.equal('GET', originalReq.method);
    });
  });

  it('should set the original request body to the `req.originReq` object', function () {
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      body: {
        a: 1,
        b: 22,
        c: 333
      },
      json: true
    }).then(function (res) {
      var body = res.body;
      assert.equal('POST', originalReq.method);
      assert.equal('{"a":1,"b":22,"c":333}', originalReq.body);
      assert.deepEqual({'a': 1, 'b': 22, 'c': 333}, body.body);
    });
  });
});

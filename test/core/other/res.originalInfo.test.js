var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - proxy_set_header', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'headers.rewrite');
  var originalRes = {};

  before(function () {
    testServer.listen(6789);
    proxyServer = new Proxy(8848);
    global.log = proxyServer.logger;

    proxyServer.addRewriteFile(rewriteFile);
    proxyServer.start();

    proxyServer.on('response', function (data) {
      var res = data.res;
      originalRes = res.originalInfo;
    });
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  it('should set the original response headers to the `res.originalInfo` object', function () {
    // set_header From admin@hiproxy.org;
    // set_header User admin;
    // set_header Date 2018-08-08;
    return request({
      uri: 'http://hiproxy.org/res/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var headers = originalRes.headers;

      assert.equal('Hiproxy Test Server', headers['server']);
      assert.equal('hiproxy', headers['i-love']);
      assert.equal('1', headers['res-header-1']);
      assert.equal('2', headers['res-header-2']);
    });
  });

  it('should NOT set the directive modified response headers to the `res.originalInfo` object', function () {
    // set_header From admin@hiproxy.org;
    // set_header User admin;
    // set_header Date 2018-08-08;
    return request({
      uri: 'http://hiproxy.org/res/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var headers = originalRes.headers;

      assert.equal(undefined, headers['from']);
      assert.equal(undefined, headers['user']);
      assert.notEqual('2018-08-08', headers['date']);
    });
  });

  it('should send all response headers to the client', function () {
    // set_header From admin@hiproxy.org;
    // set_header User admin;
    // set_header Date 2018-08-08;
    return request({
      uri: 'http://hiproxy.org/res/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var headers = originalRes.headers;
      var allHeaders = res.response.headers;

      // original headers
      assert.equal('Hiproxy Test Server', headers['server']);
      assert.equal('hiproxy', headers['i-love']);
      assert.equal('1', headers['res-header-1']);
      assert.equal('2', headers['res-header-2']);

      // directives headers
      assert.equal('admin@hiproxy.org', allHeaders['from']);
      assert.equal('admin', allHeaders['user']);
      assert.equal('2018-08-08', allHeaders['date']);
    });
  });

  it('should set the original response info to the `res.originalInfo` object', function () {
    return request({
      uri: 'http://hiproxy.org/res/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      assert.equal('200', originalRes.statusCode, 'original statusCode NOT right');
      assert.equal('OK', originalRes.statusMessage, 'original statusMessage NOT right');
    });
  });

  it('should set the original response body to the `res.originalInfo` object', function () {
    return request({
      uri: 'http://hiproxy.org/res/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      assert.equal('it works', originalRes.body.toString());
    });
  });
});

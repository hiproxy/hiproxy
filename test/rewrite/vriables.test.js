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
    proxyServer = new Proxy(8848, 1111);
    global.log = proxyServer.logger;

    proxyServer.addRewriteFile(rewriteFile);
    proxyServer.start();
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  it('URL-related variables (HTTP)', function () {
    return request({
      uri: 'http://hiproxy.org/a/b/?a=b&c=d#header',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;

      assert.equal(body.host, 'hiproxy.org');
      assert.equal(body.hostname, 'hiproxy.org');
      assert.equal(body.search, '?a=b&c=d');
      assert.equal(body.query_string, 'a=b&c=d');
      assert.equal(body.scheme, 'http');
      assert.equal(body.request_uri, 'http://hiproxy.org/a/b/?a=b&c=d');
      assert.equal(body.uri, 'http://hiproxy.org/a/b/?a=b&c=d');
      assert.equal(body.path, '/a/b/?a=b&c=d');
      assert.equal(body.path_name, '/a/b/');
      assert.equal(body.base_name, 'b');
      assert.equal(body.dir_name, '/a');
    });
  });

  it('URL-related variables (HTTPS)', function () {
    return request({
      uri: 'https://hiproxy.org/a/b/?a=b&c=d#header',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      strictSSL: false
    }).then(function (res) {
      var body = res.body;

      assert.equal(body.host, 'hiproxy.org');
      assert.equal(body.hostname, 'hiproxy.org');
      assert.equal(body.search, '?a=b&c=d');
      assert.equal(body.query_string, 'a=b&c=d');
      assert.equal(body.scheme, 'https');
      assert.equal(body.request_uri, 'https://hiproxy.org/a/b/?a=b&c=d');
      assert.equal(body.uri, 'https://hiproxy.org/a/b/?a=b&c=d');
      assert.equal(body.path, '/a/b/?a=b&c=d');
      assert.equal(body.path_name, '/a/b/');
      assert.equal(body.base_name, 'b');
      assert.equal(body.dir_name, '/a');
    });
  });

  it('cookie-related variables', function () {
    return request({
      uri: 'http://hiproxy.org/cookie/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        cookie: 'pkg=hiproxy; version=v1.2.3; sign=Z2JJT=L77WXXH1=B; size=200KB'
      }
    }).then(function (res) {
      var body = res.body;

      assert.equal(body.pkg, 'hiproxy');
      assert.equal(body.version, 'v1.2.3');
      assert.equal(body.sign, 'Z2JJT=L77WXXH1=B');
      assert.equal(body.size, '200KB');
    });
  });

  it('headers-related variables', function () {
    return request({
      uri: 'http://hiproxy.org/header/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        'custom-header': '1',
        'user-agent': 'hiproxy test/v1.2.3'
      }
    }).then(function (res) {
      var body = res.body;

      assert.equal(body.custom_header, '1');
      assert.equal(body.user_agent, 'hiproxy test/v1.2.3');
      assert.equal(body.host, 'hiproxy.org');
    });
  });

  it('regexp-related variables', function () {
    return request({
      uri: 'http://hiproxy.org/regexp/file/mock.json?cache=false&type=json',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;

      assert.equal(body.type, 'file');
      assert.equal(body.name, 'mock.json');
      assert.equal(body.others, '?cache=false&type=json');
    });
  });
});

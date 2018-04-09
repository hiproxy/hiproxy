var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - proxy_pass', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'proxy_pass.rewrite');
  var hostsFile = path.join(__dirname, 'conf', 'hosts');

  before(function () {
    testServer.listen(6789);
    proxyServer = new Proxy(8848, 8849);
    global.log = proxyServer.logger;

    proxyServer.addRewriteFile(rewriteFile);
    proxyServer.addHostsFile(hostsFile);
    proxyServer.start();
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  describe('hiproxy.org/ => 127.0.0.1:6789/blog/', function () {
    it('/ => /blog/', function () {
      return request({
        uri: 'http://hiproxy.org/',
        proxy: 'http://127.0.0.1:8848',
        json: true,
        gzip: true
      }).then(function (res) {
        var body = res.body;
        assert.equal(body.url, '/blog/');
      });
    });

    it('/post => /article/post', function () {
      return request({
        uri: 'http://hiproxy.org/post',
        proxy: 'http://127.0.0.1:8848',
        gzip: true,
        json: true
      }).then(function (res) {
        var body = res.body;
        assert.equal(body.url, '/article/post');
      });
    });

    it('/post/2016/06 => /test/post/2016/06', function () {
      return request({
        uri: 'http://hiproxy.org/post/2016/06',
        proxy: 'http://127.0.0.1:8848',
        gzip: true,
        json: true
      }).then(function (res) {
        var body = res.body;

        assert.equal(body.url, '/test/post/2016/06');
      });
    });

    it('/post/2016/06?sort=hits&limit=10 => /test/post/2016/06?sort=hits&limit=10', function () {
      return request({
        uri: 'http://hiproxy.org/post/2016/06?sort=hits&limit=10',
        proxy: 'http://127.0.0.1:8848',
        gzip: true,
        json: true
      }).then(function (res) {
        var body = res.body;

        assert.equal(body.url, '/test/post/2016/06?sort=hits&limit=10');
        assert.equal(body.query.sort, 'hits');
        assert.equal(body.query.limit, '10');
      });
    });
  });

  describe('direct request(no rewrite rule)', function () {
    it('http://127.0.0.1:6789/just/test/', function () {
      return request({
        uri: 'http://127.0.0.1:6789/just/test/',
        proxy: 'http://127.0.0.1:8848',
        gzip: true,
        json: true
      }).then(function (res) {
        var body = res.body;

        assert.equal(body.url, '/just/test/');
      });
    });
  });

  describe('use hosts rewrite rule', function () {
    it('should rewrite `www.hiproxy.com` to `127.0.0.1`', function () {
      return request({
        uri: 'http://www.hiproxy.com:6789/just/test/',
        proxy: 'http://127.0.0.1:8848',
        gzip: true,
        json: true
      }).then(function (res) {
        var body = res.body;

        assert.equal(body.url, '/just/test/');
      });
    });
  });

  describe('status code', function () {
    it('should return 404', function () {
      return request({
        uri: 'http://127.0.0.1:6789/just/test/?statusCode=404',
        proxy: 'http://127.0.0.1:8848',
        json: true
      }).then(function (res) {
        var response = res.response;

        assert.equal(response.statusCode, 404);
      });
    });

    it('should return 500', function () {
      return request({
        uri: 'http://127.0.0.1:6789/just/test/?statusCode=500',
        proxy: 'http://127.0.0.1:8848',
        json: true
      }).then(function (res) {
        var response = res.response;
        assert.equal(response.statusCode, 500);
      });
    });
  });

  describe('proxy to `https` server', function () {
    it('should return remote `https` content', function () {
      return request({
        uri: 'http://hiproxy.org/ssl/',
        proxy: 'http://127.0.0.1:8848'
      }).then(function (res) {
        var body = res.body;
        var response = res.response;

        assert.equal(response.statusCode, 200);
        assert.equal(body, 'the man in the middle page: /');
      });
    });
  });
});

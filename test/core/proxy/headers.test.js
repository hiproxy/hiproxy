var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#proxy - request and response headers', function () {
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

  describe('#request header', function () {
    it('should send the original headers to remote server', function () {
      return request({
        uri: 'http://hiproxy.org/',
        proxy: 'http://127.0.0.1:8848',
        json: true,
        headers: {
          'Proxy-Server': 'hiproxy',
          'Custom-Field': 'value'
        }
      }).then(function (res) {
        var body = res.body;
        var headers = body.headers;

        assert.equal('hiproxy', headers['proxy-server']);
        assert.equal('value', headers['custom-field']);
      });
    });
  });

  describe('#response header', function () {
    it('should send the original remote server headers to client', function () {
      return request({
        uri: 'http://hiproxy.org/',
        proxy: 'http://127.0.0.1:8848',
        json: true
      }).then(function (res) {
        var headers = res.response.headers;

        assert.equal('hiproxy', headers['i-love']);
        assert.equal('Hiproxy Test Server', headers['server']);
      });
    });

    it('should get the original `content-length` and body', function () {
      return request({
        uri: 'http://hiproxy.org/?gzip=false',
        proxy: 'http://127.0.0.1:8848',
        json: true
      }).then(function (res) {
        var headers = res.response.headers;

        assert.ok(headers['content-length'] > 0);
        assert.equal('你好！ Hello привет สวัสดี 안녕하세요. こんにちは', res.body.str);
        assert.equal('🌍🔗🎈', res.body.emoji);
      });
    });

    it('should set the right `content-length` when modify the body use directive', function () {
      var originalStr = '你好！ Hello привет สวัสดี 안녕하세요. こんにちは 🌍🔗🎈';
      return request({
        uri: 'http://hiproxy.org/mod_directive/?gzip=false&responseBody=' + encodeURI(originalStr),
        proxy: 'http://127.0.0.1:8848',
        json: true
      }).then(function (res) {
        var headers = res.response.headers;
        var str = originalStr + ' 🍌🍺 欢迎使用hiproxy！';
        assert.equal(Buffer.byteLength(str), headers['content-length']);
        assert.equal(str, res.body);
      });
    });

    it('should set the right `content-length` when modify the body use callback', function () {
      var appendStr = ' 🍌🍺 欢迎使用hiproxy！';
      var cbk = function (detail) {
        var body = detail.res.body;
        detail.res.body = body + appendStr;
        return detail;
      };
      var originalStr = '你好！ Hello привет สวัสดี 안녕하세요. こんにちは 🌍🔗🎈';

      proxyServer.addCallback('onBeforeResponse', cbk);

      return request({
        uri: 'http://hiproxy.org/?gzip=false&responseBody=' + encodeURI(originalStr),
        proxy: 'http://127.0.0.1:8848',
        json: true
      }).then(function (res) {
        var headers = res.response.headers;
        var str = originalStr + appendStr;

        assert.equal(Buffer.byteLength(str), headers['content-length']);
        assert.equal(str, res.body);
      });
    });

    it('should set the right `content-length` when modify the body use callback AND directives', function () {
      var appendStr = ' 🍌🍺 欢迎使用hiproxy！';
      var originalStr = '你好！ Hello привет สวัสดี 안녕하세요. こんにちは 🌍🔗🎈';

      return request({
        uri: 'http://hiproxy.org/mod_directive/?gzip=false&responseBody=' + encodeURI(originalStr),
        proxy: 'http://127.0.0.1:8848',
        json: true
      }).then(function (res) {
        var headers = res.response.headers;
        var str = originalStr + appendStr + appendStr;

        assert.equal(Buffer.byteLength(str), headers['content-length']);
        assert.equal(str, res.body);
      });
    });
  });
});

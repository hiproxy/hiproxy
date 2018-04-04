var fs = require('fs');
var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - alias', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'alias.rewrite');

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

  describe('basic', function () {
    it('should redirect to the local file system when use `alias`', function () {
      // alias ../files/;
      return request({
        uri: 'http://hiproxy.org/index.html',
        proxy: 'http://127.0.0.1:8848'
      }).then(function (res) {
        assert.ok(res.body.indexOf('<p>it works!</p>') !== -1);
      });
    });

    it('should send default file to client', function () {
      // alias ../files/;
      return request({
        uri: 'http://hiproxy.org/',
        proxy: 'http://127.0.0.1:8848'
      }).then(function (res) {
        assert.ok(res.body.indexOf('<p>it works!</p>') !== -1);
      });
    });

    it('should send file with absolute file path', function () {
      var rewrite = [
        'domain test.hiproxy.org {',
        '  location / {',
        '    alias ' + path.join(__dirname, 'files'),
        '  }',
        '}'
      ];

      proxyServer.addRule('rewrite', rewrite.join('\n'));

      // send_file <absolute-path>;
      return request({
        uri: 'http://test.hiproxy.org/',
        proxy: 'http://127.0.0.1:8848'
      }).then(function (res) {
        var body = res.body;
        assert.ok(body.indexOf('<p>it works!</p>') !== -1);
      });
    });
  });

  describe('content type', function () {
    it('should send the content-type header based on the file name', function () {
      // alias ../files/;
      return request({
        uri: 'http://hiproxy.org/data.json',
        proxy: 'http://127.0.0.1:8848'
      }).then(function (res) {
        assert.equal('application/json', res.response.headers['content-type']);
      });
    });

    it('should return the default content type `application/octet-stream`', function () {
      // alias ../files/;
      return request({
        uri: 'http://hiproxy.org/rewrite.hiproxy',
        proxy: 'http://127.0.0.1:8848'
      }).then(function (res) {
        assert.equal('application/octet-stream', res.response.headers['content-type']);
      });
    });
  });

  describe('error handle', function () {
    it('should send 404 content when file not exists', function () {
      // alias ../files/;
      return request({
        uri: 'http://hiproxy.org/404.html',
        proxy: 'http://127.0.0.1:8848'
      }).then(function (res) {
        assert.equal(404, res.response.statusCode);
      });
    });

    it('should send 500 content when has other errors', function () {
      var old = fs.statSync;
      fs.statSync = function (filePath) {
        throw Error('Unkonw error: read ' + filePath + ' failed');
      };
      return request({
        uri: 'http://hiproxy.org/500.html',
        proxy: 'http://127.0.0.1:8848'
      }).then(function (res) {
        fs.statSync = old;
        assert.equal(500, res.response.statusCode);
      });
    });
  });

  describe('with other directives', function () {
    it('should work with `echo`', function () {
      // alias ../files/;
      // echo 'echo cntent';
      return request({
        uri: 'http://hiproxy.org/echo/',
        proxy: 'http://127.0.0.1:8848'
      }).then(function (res) {
        assert.ok(res.body.indexOf('<p>it works!</p>') !== -1);
        assert.ok(res.body.indexOf('echo content') !== -1);
      });
    });

    it('should ignore `proxy_pass` when use `alias`', function () {
      // alias ../files/;
      // proxy_pass http://127.0.0.1:6789/proxy/;
      return request({
        uri: 'http://hiproxy.org/proxy/',
        proxy: 'http://127.0.0.1:8848'
      }).then(function (res) {
        assert.ok(res.body.indexOf('<p>it works!</p>') !== -1);
        assert.ok(res.body.indexOf('"url":"/proxy/"') === -1);
      });
    });

    it('should work with `send_file`', function () {
      // alias ../files/;
      // send_file ../files/data.json;
      return request({
        uri: 'http://hiproxy.org/send/',
        proxy: 'http://127.0.0.1:8848'
      }).then(function (res) {
        assert.ok(res.body.indexOf('<p>it works!</p>') !== -1);
        assert.ok(res.body.indexOf('"name": "zdying"') !== -1);
      });
    });
  });
});

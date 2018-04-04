var assert = require('assert');
var request = require('request');
var path = require('path');

var Proxy = require('../../src/server');
var testServer = require('../testServer');

describe('#proxy headers', function () {
  var proxyServer;
  before(function () {
    testServer.listen(9000);

    proxyServer = new Proxy(9001);
    proxyServer.addRewriteFile(path.join(__dirname, 'conf', 'proxy_header.rewrite'));
    proxyServer.start();
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  describe('#proxy_set_header', function () {
    it('should set request headers correctly', function (done) {
      request({
        uri: 'http://test.example.com/',
        proxy: 'http://127.0.0.1:9001',
        json: true,
        gzip: true,
        headers: {
          'set-cookie': ['a=1', 'b=2', 'c=3']
        }
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }
        var headers = body.headers;

        // console.log('test.example.com', response.headers, body);

        assert.equal(headers.host, 'test.example.com');
        assert.equal(headers.proxy_app, 'hiproxy');

        assert.equal(headers.host, 'test.example.com');
        assert.deepEqual(headers['set-cookie'], [ 'a=1', 'b=2', 'c=3', 'd=4' ]);

        done();
      });
    });
  });

  describe('#proxy_hide_header', function () {
    it('should hide request headers correctly', function (done) {
      request({
        uri: 'http://test.example.com/',
        proxy: 'http://127.0.0.1:9001',
        json: true,
        gzip: true,
        headers: {
          'A': 'aa',
          'B': 'bb',
          'c': 'cc'
        }
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        var headers = body.headers;

        assert.equal(headers.c, 'cc');
        assert.equal(headers.a, undefined);
        assert.equal(headers.b, undefined);

        done();
      });
    });
  });

  describe('#set_header', function () {
    it('should set response headers correctly', function (done) {
      request({
        uri: 'http://test.example.com/',
        proxy: 'http://127.0.0.1:9001',
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        var headers = response.headers;

        assert.equal(headers.proxy_app, 'hiproxy');
        assert.equal(headers.host, 'test.example.com');

        done();
      });
    });
  });

  describe('#hide_header', function () {
    it('should set response headers correctly', function (done) {
      request({
        uri: 'http://test.example.com/',
        proxy: 'http://127.0.0.1:9001',
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        var headers = response.headers;

        assert.equal(headers.date, undefined);
        assert.equal(headers.connection, undefined);

        done();
      });
    });
  });
});

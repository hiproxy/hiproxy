var assert = require('assert');
var request = require('request');
var path = require('path');

var Proxy = require('../../src/index');
var testServer = require('../testServer');

describe('#proxy location regexp', function () {
  var proxyServer;
  before(function () {
    testServer.listen(9000);

    proxyServer = new Proxy(9001);
    proxyServer.addRewriteFile(path.join(__dirname, 'conf', 'base.rewrite'));
    proxyServer.start();
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  describe('#base: ~ /api/ => /test/api/', function () {
    it('should redirect `/api/` to `/test/api/`', function (done) {
      request({
        uri: 'http://blog.example.com/api/',
        proxy: 'http://127.0.0.1:9001',
        gzip: true,
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        assert.equal(body.url, '/test/api/');

        done();
      });
    });
  });

  describe('#group: ~ /post/(.*) => /test/post/$1', function () {
    it('should redirect `/post/1` to `/test/post/1`', function (done) {
      request({
        uri: 'http://blog.example.com/post/1',
        proxy: 'http://127.0.0.1:9001',
        gzip: true,
        json: true
      }, function (err, response, body) {
        if (err) {
          done(err);
        }
        assert.equal(body.url, '/test/post/1');

        done();
      });
    });

    it('should redirect `/post/2016/06` to `/test/post/2016/06`', function (done) {
      request({
        uri: 'http://blog.example.com/post/2016/06',
        proxy: 'http://127.0.0.1:9001',
        gzip: true,
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        assert.equal(body.url, '/test/post/2016/06');
        done();
      });
    });

    it('should redirect `/post/2016/06?sort=hits&limit=10` to `/test/post/2016/06?sort=hits&limit=10`', function (done) {
      request({
        uri: 'http://blog.example.com/post/2016/06?sort=hits&limit=10',
        proxy: 'http://127.0.0.1:9001',
        gzip: true,
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        assert.equal(body.url, '/test/post/2016/06?sort=hits&limit=10');
        assert.equal(body.query.sort, 'hits');
        assert.equal(body.query.limit, '10');
        done();
      });
    });
  });
});

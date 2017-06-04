var assert = require('assert');
var request = require('request');
var path = require('path');

var Proxy = require('../../src/index');
var testServer = require('../testServer');

describe('#proxy pass', function () {
  var proxyServer;
  before(function () {
    testServer.listen(9000);

    proxyServer = new Proxy(9001, 10020);
    proxyServer.addRewriteFile(path.join(__dirname, 'conf', 'base.rewrite'));
    proxyServer.addHostsFile(path.join(__dirname, 'conf', 'base.hosts'));

    proxyServer.start();
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  describe('test.example.com/ => 127.0.0.1:9000/test/', function () {
    it('/ => /test/', function (done) {
      request({
        uri: 'http://test.example.com/',
        proxy: 'http://127.0.0.1:9001',
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        assert.equal(body.url, '/test/');

        done();
      });
    });

    it('/post => /test/post', function (done) {
      request({
        uri: 'http://test.example.com/post',
        proxy: 'http://127.0.0.1:9001',
        json: true
      }, function (err, response, body) {
        if (err) {
          done(err);
        }
        assert.equal(body.url, '/test/post');

        done();
      });
    });

    it('/post/2016/06 => /test/post/2016/06', function (done) {
      request({
        uri: 'http://test.example.com/post/2016/06',
        proxy: 'http://127.0.0.1:9001',
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        assert.equal(body.url, '/test/post/2016/06');
        done();
      });
    });

    it('/post/2016/06?sort=hits&limit=10 => /test/post/2016/06?sort=hits&limit=10', function (done) {
      request({
        uri: 'http://test.example.com/post/2016/06?sort=hits&limit=10',
        proxy: 'http://127.0.0.1:9001',
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

  describe('direct request(no rewrite rule)', function () {
    it('http://127.0.0.1:9000/just/test/', function (done) {
      request({
        uri: 'http://127.0.0.1:9000/just/test/',
        proxy: 'http://127.0.0.1:9001',
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        assert.equal(body.url, '/just/test/');
        done();
      });
    });
  });

  describe('use hosts rewrite rule', function () {
    it('should rewrite `www.example.com` to `127.0.0.1`', function (done) {
      request({
        uri: 'http://www.example.com:9000/just/test/',
        proxy: 'http://127.0.0.1:9001',
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        assert.equal(body.url, '/just/test/');
        done();
      });
    });
  });

  describe('status code', function () {
    it('should return 404', function (done) {
      request({
        uri: 'http://127.0.0.1:9000/just/test/?statusCode=404',
        proxy: 'http://127.0.0.1:9001',
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        assert.equal(response.statusCode, 404);
        done();
      });
    });

    it('should return 404', function (done) {
      request({
        uri: 'http://ajfalbjclamkll',
        proxy: 'http://127.0.0.1:9001',
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        assert.equal(response.statusCode, 404);
        done();
      });
    });
  });

  describe('proxy to `https` server', function () {
    it('should return remote `https` content', function (done) {
      request({
        uri: 'http://blog.example.com/ssl/',
        proxy: 'http://127.0.0.1:9001'
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        console.log(body);

        assert.equal(response.statusCode, 200);
        assert.equal(body, 'the man in the middle page: /');
        done();
      });
    });
  });
});

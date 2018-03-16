var assert = require('assert');
var request = require('request');
var path = require('path');

var Proxy = require('../../src/server');
var testServer = require('../testServer');

describe('#global vars', function () {
  var proxyServer;
  before(function () {
    testServer.listen(9000);

    proxyServer = new Proxy(9001);
    proxyServer.addRewriteFile(path.join(__dirname, 'conf', 'global_var.rewrite'));
    proxyServer.start();
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  describe('#base: ~ /api/ => /test/api/', function () {
    it('should replace global variable rightly', function (done) {
      request({
        uri: 'http://blog.example.com/api/?action=list&id=123',
        proxy: 'http://127.0.0.1:9001',
        gzip: true,
        json: true,
        headers: {
          'User-Agent': 'hiproxy tester',
          'Cookie': 'userId=26C9D-083DAE-82843-23-3DA13B23; uname=orzg;'
        }
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        var headers = response.headers;

        assert.equal(headers.host, 'blog.example.com');
        assert.equal(headers.port, 9000);
        assert.equal(headers['query-string'], 'action=list&id=123');
        assert.equal(headers.scheme, 'http');

        done();
      });
    });

    it('should replace global variable rightly and has no effect with other request', function (done) {
      request({
        uri: 'http://blog.example.com/api/?action=list&id=456',
        proxy: 'http://127.0.0.1:9001',
        gzip: true,
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        var headers = response.headers;

        assert.equal(headers.host, 'blog.example.com');
        assert.equal(headers.port, 9000);
        assert.equal(headers['query-string'], 'action=list&id=456');
        assert.equal(headers.scheme, 'http');

        done();
      });
    });

    it('should replace global variable rightly - $http_name', function (done) {
      request({
        uri: 'http://blog.example.com/api/?action=list&id=789',
        proxy: 'http://127.0.0.1:9001',
        gzip: true,
        json: true,
        headers: {
          'Accept-Encoding': 'gzip',
          'User-Agent': 'hiproxy tester'
        }
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        var headers = response.headers;

        assert.equal(headers['user-agent'], 'hiproxy tester');
        assert.equal(headers['accept-encoding-value'], 'gzip');

        done();
      });
    });

    it('should replace global variable rightly - $cookie_name', function (done) {
      request({
        uri: 'http://blog.example.com/api/?action=list&id=789',
        proxy: 'http://127.0.0.1:9001',
        gzip: true,
        json: true,
        headers: {
          'Cookie': 'userId=26C9D-083DAE-82843-23-3DA13B23; uname=orzg;'
        }
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        var headers = response.headers;

        assert.equal(headers['cookie-userid'], '26C9D-083DAE-82843-23-3DA13B23');
        assert.equal(headers['cookie-uname'], 'orzg');

        done();
      });
    });
  });
  describe('#hiproxyServer: event emit', function () {
    it('should monitor request event', function (done) {
      request({
        uri: 'http://blog.example.com/api/?action=list&id=123',
        proxy: 'http://127.0.0.1:9001',
        gzip: true,
        json: true,
        headers: {
          'User-Agent': 'hiproxy tester',
          'Cookie': 'userId=26C9D-083DAE-82843-23-3DA13B23; uname=orzg;'
        }
      });
      proxyServer.on('request', function (request, response) {
        assert.ok(request);
        assert.ok(response);
      });
      proxyServer.on('response', function (detail) {
        assert.ok(detail.req);
        assert.ok(detail.res);
      });
      proxyServer.on('data', function (detail) {
        assert.ok(detail.data);
        assert.ok(detail.req);
        assert.ok(detail.res);
      });
      done();
    });
  });
});

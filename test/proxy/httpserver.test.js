var assert = require('assert');
var request = require('request');
var http = require('http');
var path = require('path');

var Proxy = require('../../src/index');
var testServer = require('./server');

describe('#http server', function () {
  var proxyServer;
  before(function () {
    testServer.listen(61234);

    proxyServer = new Proxy(8850);
    proxyServer.addRewriteFile(path.join(__dirname, 'conf', 'rewrite'));
    proxyServer.start();
    // proxyServer.openBrowser('chrome', '127.0.0.1:8850', false);
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  describe('#api', function () {
    it('#start()', function (done) {
      var server = new Proxy(8848);
      server.start().then(function () {
        if (server.httpServer instanceof http.Server) {
          done();
        } else {
          done(new Error('server.httpServer is not an instance of http.Server'));
        }
        server.stop();
      });
    });
  });

  describe('#server response', function () {
    it('request /', function (done) {
      request('http://127.0.0.1:8850', function (err, response, body) {
        if (body.indexOf('http://127.0.0.1:8850/proxy.pac') !== -1) {
          done();
        } else {
          done(err || new Error('Body not match'));
        }
      });
    });

    it('request /proxy.pac', function (done) {
      request('http://127.0.0.1:8850/proxy.pac', function (err, response, body) {
        if (err) {
          done(err);
        }

        assert.equal(response.statusCode, 200);
        // assert.notEqual(body.indexOf('FindProxyForURL'), -1);
        done();
      });
    });

    it('request /favicon.ico', function (done) {
      request('http://127.0.0.1:8850/favicon.ico', function (err, response, body) {
        if (err) {
          done(err);
        }

        assert.equal(response.statusCode, 200);
        assert.equal(body, '');
        done();
      });
    });
  });

  describe('# proxy', function () {
    it('request t.ttt.com/', function (done) {
      request({
        uri: 'http://t.ttt.com/',
        proxy: 'http://127.0.0.1:8850'
      }, function (err, response, body) {
        if (body === 'Hello, hiproxy') {
          done();
        } else {
          done(err || new Error('Body not match'));
        }
      });
    });

    it('request t.ttt.com/t/ proxy ok', function (done) {
      request({
        uri: 'http://t.ttt.com/t/',
        proxy: 'http://127.0.0.1:8850'
      }, function (err, response, body) {
        if (body === 'GET /test/ OK.') {
          done();
        } else {
          done(err || new Error('Body not match'));
        }
      });
    });

    it('request t.ttt.com/t/ header ok', function (done) {
      request({
        uri: 'http://t.ttt.com/t/',
        proxy: 'http://127.0.0.1:8850'
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        var headers = response.headers;

        assert.equal('t.ttt.com', headers.host);
        assert.equal('hiproxy', headers.proxy_app);
        assert.equal('1', headers.set_header_field_1);
        assert.deepEqual(['cookie1=c1', 'cookie2=c2'].sort(), headers['set-cookie'].sort());

        done();
      });
    });

    it('request t.ttt.com/source/ (alias, root)', function (done) {
      request({
        uri: 'http://t.ttt.com/source/',
        proxy: 'http://127.0.0.1:8850'
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        var headers = response.headers;

        assert.equal('<p>hello, hiproxy</p>', body);
        assert.equal('text/html', headers['content-type']);
        assert.equal('hiproxy_static', headers.server);

        done();
      });
    });

    it('request t.ttt.com/source/a.json', function (done) {
      request({
        uri: 'http://t.ttt.com/source/a.json',
        proxy: 'http://127.0.0.1:8850'
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        var headers = response.headers;

        assert.equal('{"ret": true}', body);
        assert.equal('application/json', headers['content-type']);

        done();
      });
    });
  });

  describe('# commands', function () {
    it('request t.ttt.com/', function (done) {
      request({
        uri: 'http://t.ttt.com/t/',
        proxy: 'http://127.0.0.1:8850'
      }, function (err, response, body) {
        var headers = response.headers;
        var setHeaderField1 = headers['set_header_field_1'];

        if (setHeaderField1 === '1') {
          done();
        } else {
          done(err || new Error('`set-header` result not right'));
        }
      });
    });
  });
  describe('# commands', function () {
    it('request t.ttt.com/', function (done) {
      request({
        uri: 'http://t.ttt.com/source/b.json',
        proxy: 'http://127.0.0.1:8850'
      }, function (err, response, body) {
        if (response.statusCode === 404) {
          done();
        } else {
          done(err || new Error('response status not right'));
        }
      });
    });
  });
});

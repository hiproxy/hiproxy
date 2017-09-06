var assert = require('assert');
var request = require('request');
// var http = require('http');
// var https = require('https');
var path = require('path');

var Proxy = require('../../src/index');
var testServer = require('./server');

describe('#https server', function () {
  var proxyServer;
  before(function () {
    testServer.listen(61234);

    proxyServer = new Proxy(8850, 10011);
    proxyServer.addRewriteFile(path.join(__dirname, 'conf', 'rewrite'));
    proxyServer.start();
    // proxyServer.openBrowser('chrome', '127.0.0.1:8850', true);
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  // describe('#api', function () {
  //   it('#start()', function (done) {
  //     var server = new Proxy(8848, 10012);
  //     server.start().then(function () {
  //       if (server.httpsServer instanceof https.Server) {
  //         done();
  //       } else {
  //         done(new Error('server.httpsServer is not an instance of https.Server'));
  //       }
  //       server.stop();
  //     });
  //   });
  // });

  describe('#server response', function () {
    it('request /', function (done) {
      request({
        url: 'https://127.0.0.1:10011/',
        rejectUnauthorized: false
      }, function (err, response, body) {
        if (err) {
          done(err || new Error('Body not match'));
        } else if (body.indexOf('the man in the middle page: /') !== -1) {
          done();
        }
      });
    });
  });

  describe('# proxy', function () {
    it('request t.ttt.com/', function (done) {
      request({
        uri: 'https://t.ttt.com/',
        proxy: 'http://127.0.0.1:8850',
        rejectUnauthorized: false
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
        uri: 'https://t.ttt.com/t/',
        proxy: 'http://127.0.0.1:8850',
        rejectUnauthorized: false
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
        uri: 'https://t.ttt.com/t/',
        proxy: 'http://127.0.0.1:8850',
        rejectUnauthorized: false
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
        uri: 'https://t.ttt.com/source/',
        proxy: 'http://127.0.0.1:8850',
        rejectUnauthorized: false
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        var headers = response.headers;

        assert.equal('<p>hello, hiproxy</p>', body);
        assert.equal('text/html', headers['content-type']);

        done();
      });
    });

    it('request t.ttt.com/source/a.json', function (done) {
      request({
        uri: 'https://t.ttt.com/source/a.json',
        proxy: 'http://127.0.0.1:8850',
        rejectUnauthorized: false
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

    it('should return remote content when request https://www.example.com/', function (done) {
      request({
        uri: 'https://www.example.com/',
        proxy: 'http://127.0.0.1:8850',
        rejectUnauthorized: false
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        var statusCode = response.statusCode;

        assert.equal(statusCode, 200);

        done();
      });
    });

    it('should return error content when request https://www.example-domain-not-exists.com/', function (done) {
      request({
        uri: 'https://www.example-domain-not-exists.com/',
        proxy: 'http://127.0.0.1:8850',
        rejectUnauthorized: false
      }, function (err, response, body) {
        assert.notEqual(err, null);

        done();
      });
    });
  });
});

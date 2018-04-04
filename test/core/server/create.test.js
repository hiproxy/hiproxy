var assert = require('assert');
var http = require('http');
var https = require('https');

var Proxy = require('../../../src/server');

describe('#server', function () {
  var proxyServer;

  describe('create http server', function (done) {
    it('should create the HTTP server and HTTPS server', function (done) {
      proxyServer = new Proxy(8850, 0);
      proxyServer.start().then(function () {
        assert.equal(true, proxyServer.httpServer instanceof http.Server);
        assert.equal(true, proxyServer.httpsServer instanceof https.Server);

        done();
        proxyServer.stop();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Should use the user-specified port number', function (done) {
      proxyServer = new Proxy(8850, 6457);
      proxyServer.start().then(function () {
        assert.equal(8850, proxyServer.httpServer.address().port);
        assert.equal(6457, proxyServer.httpsServer.address().port);

        done();
        proxyServer.stop();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Should use a random port for HTTP server when port number is NOT specified', function (done) {
      proxyServer = new Proxy();
      proxyServer.start().then(function () {
        assert.equal(true, Number(proxyServer.httpServer.address().port) > 0);

        done();
        proxyServer.stop();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Should NOT create HTTPS server when port number is NOT specified', function (done) {
      proxyServer = new Proxy();
      proxyServer.start().then(function () {
        assert.equal(undefined, proxyServer.httpsServer);

        done();
        proxyServer.stop();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Should NOT create HTTPS server when port number is null', function (done) {
      proxyServer = new Proxy({httpsPort: null});
      proxyServer.start().then(function () {
        assert.equal(undefined, proxyServer.httpsServer);

        done();
        proxyServer.stop();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Should use a random port number when port number is 0', function (done) {
      proxyServer = new Proxy(0, 0);
      proxyServer.start().then(function () {
        assert.equal(true, Number(proxyServer.httpServer.address().port) > 0);
        assert.equal(true, Number(proxyServer.httpsServer.address().port) > 0);

        done();
        proxyServer.stop();
      }).catch(function (err) {
        done(err);
      });
    });

    it('Should change callbacks to Array', function () {
      var cbk = function () { };
      var proxyServer = new Proxy({
        onBeforeRequest: cbk
      });
      var cbks = proxyServer.options.onBeforeRequest;

      assert.equal(true, Array.isArray(cbks));
      assert.equal(1, cbks.length);
    });
  });
});

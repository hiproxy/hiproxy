var assert = require('assert');
var request = require('request');
var path = require('path');

var Proxy = require('../../src/server');

describe('#http server', function () {
  var proxyServer;
  before(function () {
    proxyServer = new Proxy(8850);
    proxyServer.addRewriteFile(path.join(__dirname, 'rewrite'));
    proxyServer.start();
  });

  after(function () {
    proxyServer.stop();
  });

  describe('# directive - echo', function () {
    it('# should echo rightly', function (done) {
      request({
        uri: 'http://echo.hiproxy.org/',
        proxy: 'http://127.0.0.1:8850'
      }, function (err, response, body) {
        var index = body.indexOf('<h1>hello_echo</h1>');

        assert.equal(err, null);
        assert.notEqual(index, -1);
        done();
      });
    });

    it('# should echo rightly', function (done) {
      request({
        uri: 'http://echo.hiproxy.org/multiple',
        proxy: 'http://127.0.0.1:8850'
      }, function (err, response, body) {
        var index = body.indexOf('<h1>hello_echo</h1>');
        var index1 = body.indexOf('<p>test echo directive</p>');
        var index2 = body.indexOf('<span>div &gt; span</span>');
        var index3 = body.indexOf('<p>finish</p>');

        assert.equal(err, null);
        assert.equal(true, index < index1);
        assert.equal(true, index1 < index2);
        assert.equal(true, index2 < index3);
        done();
      });
    });
  });
});

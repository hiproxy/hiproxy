var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - proxy_set_cookie', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'cookie.rewrite');

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

  it('should add new cookie field', function () {
    // proxy_set_cookie uname zdying;
    return request({
      uri: 'http://hiproxy.org/set_cookie/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      json: true
    }).then(function (res) {
      var cookie = res.body.cookie;

      assert.deepEqual(['uname'], Object.keys(cookie));
      assert.equal('zdying', cookie.uname);
    });
  });

  it('should NOT affect the original cookie', function () {
    // proxy_set_cookie uname zdying;
    return request({
      uri: 'http://hiproxy.org/set_cookie/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      json: true,
      headers: {
        cookie: 'server=hiproxy; version=v2.0.0'
      }
    }).then(function (res) {
      var cookie = res.body.cookie;

      assert.deepEqual(['server', 'version', 'uname'], Object.keys(cookie));
      assert.equal('zdying', cookie.uname);
      assert.equal('v2.0.0', cookie.version);
      assert.equal('hiproxy', cookie.server);
    });
  });

  it('should NOT overwrite the existing fields in the cookie', function () {
    // proxy_set_cookie uname zdying;
    return request({
      uri: 'http://hiproxy.org/set_cookie/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      json: true,
      headers: {
        cookie: 'uname=123456'
      }
    }).then(function (res) {
      var cookie = res.body.rawCookie;

      assert.equal('uname=123456; uname=zdying', cookie);
    });
  });

  it('should NOT overwrite the existing fields in the cookie', function () {
    // proxy_set_cookie uname zdying;
    // proxy_set_cookie uid 1234567890;
    return request({
      uri: 'http://hiproxy.org/set_more_cookie/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      json: true,
      headers: {
        cookie: 'uname=123456'
      }
    }).then(function (res) {
      var cookie = res.body.rawCookie;

      assert.equal('1234567890', res.body.cookie.uid);
      assert.equal('uname=123456; uname=zdying; uid=1234567890', cookie);
    });
  });
});

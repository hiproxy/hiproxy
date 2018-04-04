var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - set_cookie', function () {
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
    // set_cookie uname zdying;
    return request({
      uri: 'http://hiproxy.org/set_cookie/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var cookie = res.response.headers['set-cookie'];

      assert.deepEqual(['uname=zdying'], cookie);
    });
  });

  it('should NOT affect the original cookie', function () {
    // set_cookie uname zdying;
    return request({
      uri: 'http://hiproxy.org/set_cookie/',
      proxy: 'http://127.0.0.1:8848',
      headers: {
        cookie: 'server=hiproxy; version=v2.0.0'
      },
      json: true
    }).then(function (res) {
      var cookie = res.response.headers['set-cookie'];

      assert.deepEqual(['server=hiproxy', 'version=v2.0.0', 'uname=zdying'], cookie);
    });
  });

  it('should NOT overwrite the existing fields in the cookie', function () {
    // set_cookie uname zdying;
    // set_cookie uid 1234567890;
    return request({
      uri: 'http://hiproxy.org/set_more_cookie/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        cookie: 'uname=123456'
      }
    }).then(function (res) {
      var cookie = res.response.headers['set-cookie'];

      assert.deepEqual(['uname=123456', 'uname=zdying', 'uid=1234567890'], cookie);
    });
  });
});

var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - proxy_hide_cookie', function () {
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

  it('should remove the matched cookie field', function () {
    // proxy_hide_cookie u-name;
    return request({
      uri: 'http://hiproxy.org/hide_cookie/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        cookie: 'from=admin@hiproxy.org; u-name=zdying'
      }
    }).then(function (res) {
      var cookie = res.body.cookie;

      assert.deepEqual(['from'], Object.keys(cookie));
      assert.equal('admin@hiproxy.org', cookie.from);
    });
  });

  it('should remove ALL the the matched cookie field(one directive)', function () {
    // proxy_hide_cookie uname from;
    return request({
      uri: 'http://hiproxy.org/hide_cookie_all/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        cookie: 'from=admin@hiproxy.org; uname=zdying; version=v1.2.3'
      }
    }).then(function (res) {
      var cookie = res.body.cookie;

      assert.deepEqual(['version'], Object.keys(cookie));
      assert.equal('v1.2.3', cookie.version);
    });
  });

  it('should remove ALL the the matched cookie field(multiple directives)', function () {
    // proxy_hide_cookie uname;
    // proxy_hide_cookie from;
    return request({
      uri: 'http://hiproxy.org/hide_cookie_all_m/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        cookie: 'from=admin@hiproxy.org; uname=zdying; version=v1.2.3'
      }
    }).then(function (res) {
      var cookie = res.body.cookie;

      assert.deepEqual(['version'], Object.keys(cookie));
      assert.equal('v1.2.3', cookie.version);
    });
  });

  it('should remove ALL cookie when NOT specify cookie name', function () {
    // proxy_hide_cookie;
    return request({
      uri: 'http://hiproxy.org/hide_cookie_no_param/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        cookie: 'from=admin@hiproxy.org; uname=zdying; version=v1.2.3'
      }
    }).then(function (res) {
      var cookie = res.body.cookie;

      assert.deepEqual([], Object.keys(cookie));
    });
  });

  it('hould NOT affect the original cookie when the cookie name does not exist', function () {
    // proxy_hide_cookie cookie-not-exist;
    return request({
      uri: 'http://hiproxy.org/hide_cookie_not_exists/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        cookie: 'from=admin@hiproxy.org; uname=zdying'
      }
    }).then(function (res) {
      var cookie = res.body.cookie;

      assert.deepEqual(['from', 'uname'], Object.keys(cookie));
    });
  });
});

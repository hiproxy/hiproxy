var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');
var setCookie = require('set-cookie-parser');

describe('#directives - hide_cookie', function () {
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
    // hide_cookie u-name;
    return request({
      uri: 'http://hiproxy.org/hide_cookie/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        cookie: 'from=admin@hiproxy.org; u-name=zdying'
      }
    }).then(function (res) {
      var cookies = setCookie.parse(res.response);
      var expiredCookies = getDeletedCookie(cookies, ['u-name']);

      assert.equal(1, expiredCookies.length);
      assert.equal('u-name', expiredCookies[0].name);
    });
  });

  it('should remove ALL the the matched cookie field(one directive)', function () {
    // hide_cookie uname from;
    return request({
      uri: 'http://hiproxy.org/hide_multiple_cookie/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        cookie: 'from=admin@hiproxy.org; uname=zdying; version=v1.2.3'
      }
    }).then(function (res) {
      var cookies = setCookie.parse(res.response);
      var expiredCookies = getDeletedCookie(cookies, ['uname', 'from']);

      assert.equal(2, expiredCookies.length);
      assert.equal('uname', expiredCookies[0].name);
      assert.equal('from', expiredCookies[1].name);
    });
  });

  it('should remove ALL the the matched cookie field(multiple directives)', function () {
    // hide_cookie uname;
    // hide_cookie from;
    return request({
      uri: 'http://hiproxy.org/hide_multiple_cookie_2/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        cookie: 'from=admin@hiproxy.org; uname=zdying; version=v1.2.3'
      }
    }).then(function (res) {
      var cookies = setCookie.parse(res.response);
      var expiredCookies = getDeletedCookie(cookies, ['uname', 'from']);

      assert.equal(2, expiredCookies.length);
      assert.equal('uname', expiredCookies[0].name);
      assert.equal('from', expiredCookies[1].name);
    });
  });

  // it('should remove ALL cookie when NOT specify cookie name', function () {
  //   // hide_cookie;
  //   return request({
  //     uri: 'http://hiproxy.org/hide_cookie_no_param/',
  //     proxy: 'http://127.0.0.1:8848',
  //     json: true,
  //     headers: {
  //       cookie: 'from=admin@hiproxy.org; uname=zdying; version=v1.2.3'
  //     }
  //   }).then(function (res) {
  //     var cookie = res.body.cookie;

  //     assert.deepEqual([], Object.keys(cookie));
  //   });
  // });

  it('hould NOT affect the original cookie when the cookie name does not exist', function () {
    // hide_cookie cookie-not-exist;
    return request({
      uri: 'http://hiproxy.org/hide_cookie_not_exists/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        cookie: 'from=admin@hiproxy.org; uname=zdying'
      }
    }).then(function (res) {
      var cookies = setCookie.parse(res.response);
      var expiredCookies = getDeletedCookie(cookies, ['uname', 'from']);

      assert.equal(0, expiredCookies.length);
    });
  });
});

function getDeletedCookie (cookies, list) {
  return cookies.filter(function (cookie) {
    var name = cookie.name;
    return list.indexOf(name) !== -1 && cookie.value === '' && new Date(cookie.expires) < new Date();
  });
}

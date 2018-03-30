var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - proxy_append_body', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'body.rewrite');

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

  it('should append single filed to the body', function () {
    // proxy_append_body uid 1234567890;
    return request({
      uri: 'http://hiproxy.org/append_body_once/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      body: {
        location: 'beijing',
        from: 'admin@hiproxy.org'
      },
      json: true
    }).then(function (res) {
      var body = res.body.body;

      assert.deepEqual({
        location: 'beijing',
        from: 'admin@hiproxy.org',
        uid: '1234567890'
      }, body);
    });
  });

  it('should append mutiple filed to the body', function () {
    // proxy_append_body uid 1234567890;
    // proxy_append_body uid 34567;
    // proxy_append_body uname zdying;
    return request({
      uri: 'http://hiproxy.org/append_body_multiple/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      body: {
        location: 'beijing',
        from: 'admin@hiproxy.org'
      },
      json: true
    }).then(function (res) {
      var body = res.body.body;

      assert.deepEqual({
        location: 'beijing',
        from: 'admin@hiproxy.org',
        uid: '34567',
        uname: 'zdying'
      }, body);
    });
  });

  it('should append mutiple filed to the body (form)', function () {
    // proxy_append_body uid 34567;
    // proxy_append_body uname zdying;
    return request({
      uri: 'http://hiproxy.org/append_body_form/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      form: {
        location: 'beijing',
        from: 'admin@hiproxy.org'
      }
    }).then(function (res) {
      var body = JSON.parse(res.body);

      assert.equal(
        'location=beijing&from=admin%40hiproxy.org&uid=34567&uname=zdying',
        body.rawBody
      );

      assert.deepEqual({
        location: 'beijing',
        from: 'admin@hiproxy.org',
        uid: '34567',
        uname: 'zdying'
      }, body.body);
    });
  });
});

var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - proxy_set_body', function () {
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

  it('should cover the original body', function () {
    // proxy_set_body '{"package": "hiproxy", "version": "v2.0.0"}';
    return request({
      uri: 'http://hiproxy.org/set_body/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      body: {
        location: 'beijing',
        from: 'admin@hiproxy.org'
      },
      json: true
    }).then(function (res) {
      var body = res.body.body;

      assert.deepEqual({'package': 'hiproxy', 'version': 'v2.0.0'}, body);
    });
  });

  it('should use the last set content', function () {
    // proxy_set_body '{"package": "hiproxy", "version": "v2.0.0"}';
    // proxy_set_body '{"package": "hemsl", "version": "v1.0.0"}';
    return request({
      uri: 'http://hiproxy.org/set_body_multi_times/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      body: {
        location: 'beijing',
        from: 'admin@hiproxy.org'
      },
      json: true
    }).then(function (res) {
      var body = res.body.body;

      assert.deepEqual({'package': 'hemsl', 'version': 'v1.0.0'}, body);
    });
  });

  it('should support the same format as the querystring body', function () {
    // proxy_set_body 'package=hiproxy&version=v2.0.0';
    return request({
      uri: 'http://hiproxy.org/set_body_form/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      form: {
        location: 'beijing',
        from: 'admin@hiproxy.org'
      }
    }).then(function (res) {
      var body = JSON.parse(res.body).body;
      assert.deepEqual({'package': 'hiproxy', 'version': 'v2.0.0'}, body);
    });
  });
});

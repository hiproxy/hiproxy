var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - sub_filter_last_modified', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'sub_filter.rewrite');

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

  it('should remove the `last-modified` header by default', function () {
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      assert.equal(undefined, res.response.headers['last-modified']);
    });
  });

  it('should NOT remove the `last-modified` header when `sub_filter_last_modified on`', function () {
    // sub_filter_last_modified on;
    return request({
      uri: 'http://hiproxy.org/lm_on/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      assert.notEqual(undefined, res.response.headers['last-modified']);
    });
  });

  it('should remove the `last-modified` header when `sub_filter_last_modified off`', function () {
    // sub_filter_last_modified off;
    return request({
      uri: 'http://hiproxy.org/lm_off/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      assert.equal(undefined, res.response.headers['last-modified']);
    });
  });

  it('should ignore the invalid `sub_filter_last_modified` value (remove by default)', function () {
    // sub_filter_last_modified 123;
    return request({
      uri: 'http://hiproxy.org/lm_invalid/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      assert.equal(undefined, res.response.headers['last-modified']);
    });
  });
});

var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - hide_header', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'headers.rewrite');

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

  it('should hide request header and NOT send to remote server', function () {
    // hide_header res-header-1;
    // hide_header res-header-2;
    return request({
      uri: 'http://hiproxy.org/hide_header/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var headers = res.response.headers;

      assert.equal(undefined, headers['res-header-1']);
      assert.equal(undefined, headers['res-header-2']);
    });
  });

  it('should ignore case of header field name', function () {
    // hide_header Res-Header-1;
    // hide_header RES-HeADer-2;
    return request({
      uri: 'http://hiproxy.org/hide_header_ignore_case/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var headers = res.response.headers;

      assert.equal(undefined, headers['res-header-1']);
      assert.equal(undefined, headers['res-header-2']);
    });
  });

  it('should hide all matched headers', function () {
    // hide_header res-header-1 res-header-2;
    return request({
      uri: 'http://hiproxy.org/hide_header_all/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var headers = res.response.headers;

      assert.equal(undefined, headers['res-header-1']);
      assert.equal(undefined, headers['res-header-2']);
    });
  });
});

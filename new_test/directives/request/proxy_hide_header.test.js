var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - proxy_hide_header', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'req_headers.rewrite');

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
    return request({
      uri: 'http://hiproxy.org/hide_header/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        'Will-Not-Hide': 'true',
        'Will-Hide': 'true',
        'Will-Hide-Too': 'true',
        'Date': Date.now()
      }
    }).then(function (res) {
      var body = res.body;
      var headers = body.headers;

      assert.equal('true', headers['will-not-hide']);
      assert.equal(undefined, headers['will-hide']);
      assert.equal(undefined, headers['will-hide-too']);
    });
  });

  it('should ignore case of header field name', function () {
    return request({
      uri: 'http://hiproxy.org/hide_header_ignore_case/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        'Will-Not-Hide': 'true',
        'Will-HIDE': 'true',
        'WIll-HIDe-Too': 'true',
        'Date': Date.now()
      }
    }).then(function (res) {
      var body = res.body;
      var headers = body.headers;

      assert.equal('true', headers['will-not-hide']);
      assert.equal(undefined, headers['will-hide']);
      assert.equal(undefined, headers['will-hide-too']);
    });
  });
});

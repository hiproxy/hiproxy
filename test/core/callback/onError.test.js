var path = require('path');
var assert = require('assert');
var hiproxy = require('../../../src/index');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#proxy - proxy GET request', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'rewrite');
  var caughtError = null;
  var error = Error('hiproxy test custom error');

  before(function () {
    testServer.listen(6789);
    proxyServer = new hiproxy.Server({
      httpPort: 8848,
      errorTips: false,
      onBeforeRequest: function (detail) {
        throw error;
      },
      onError: function (err, ctx) {
        caughtError = err;
      }
    });
    global.log = proxyServer.logger;

    proxyServer.addRewriteFile(rewriteFile);
    proxyServer.start();
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  it('should execute `onError()` callback when error occurred', function () {
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      assert.equal(error, caughtError);
    });
  });
});

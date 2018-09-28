var path = require('path');
var assert = require('assert');
var hiproxy = require('../../../src');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#proxy - proxy GET request', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'rewrite');

  before(function () {
    testServer.listen(6789);
    proxyServer = new hiproxy.Server({
      httpPort: 8848,
      errorTips: false,
      onBeforeRequest: function (detail) {
        detail.proxy.headers.testOnBeforeRequest = 'hi hiproxy';
      },
      onData: function (detail) {
        var body = JSON.parse(detail.data.toString('utf-8'));
        body.onData = 'hiproxy';
        detail.data = Buffer.from(JSON.stringify(body));
        return detail;
      },
      onBeforeResponse: function (detail) {
        var body = JSON.parse(detail.res.body.toString('utf-8'));
        body.body = 'boom boom boom';
        detail.res.body = Buffer.from(JSON.stringify(body));
        // modify body
        return detail;
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

  it('should execute `onBeforeRequest()` callback when before request', function () {
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      console.log(res.body);
      var testOnBeforeRequest = res.body.headers.testonbeforerequest;
      assert.equal(testOnBeforeRequest, 'hi hiproxy');
    });
  });

  it('should execute `onBeforeResponse()` callback when before response', function () {
    return request({
      uri: 'http://hiproxy.org',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      assert.equal(res.body.body, 'boom boom boom');
    });
  });

  it('should execute `onData` callback when onData', function () {
    return request({
      uri: 'http://hiproxy.org',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      assert.equal(res.body.onData, 'hiproxy');
    });
  });
});

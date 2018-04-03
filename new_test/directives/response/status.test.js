var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - status', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'status.rewrite');

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

  it('should return the specified status and message to the client.', function () {
    // status 202 'Accepted Your Money';
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      assert.equal(202, res.response.statusCode);
      assert.equal('Accepted Your Money', res.response.statusMessage);
    });
  });
});

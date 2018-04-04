var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - root', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'alias.rewrite');

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

  it('should send the specified file', function () {
    // root index.htm;
    // alias ../files/;
    return request({
      uri: 'http://hiproxy.org/root/index.html',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      assert.ok(res.body.indexOf('<p>it works!</p>') !== -1);
    });
  });

  it('should send default file to client', function () {
    // root index.htm;
    // alias ../files/;
    return request({
      uri: 'http://hiproxy.org/root/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      // index.html
      assert.ok(res.body.indexOf('<p>it works!</p>') === -1);
      // index.htm
      assert.ok(res.body.indexOf('<p>it works too!</p>') !== -1);
    });
  });
});

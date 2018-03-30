var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#proxy - request and response headers', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'rewrite');

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

  it('#request header - should send the original headers to remote server', function () {
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      headers: {
        'Proxy-Server': 'hiproxy',
        'Custom-Field': 'value'
      }
    }).then(function (res) {
      var body = res.body;
      var headers = body.headers;

      assert.equal('hiproxy', headers['proxy-server']);
      assert.equal('value', headers['custom-field']);
    });
  });

  it('#response header - should send the original remote server headers to client', function () {
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var headers = res.response.headers;

      assert.equal('hiproxy', headers['i-love']);
      assert.equal('Hiproxy Test Server', headers['server']);
    });
  });
});

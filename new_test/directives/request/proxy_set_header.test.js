var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - proxy_set_header', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'rewrite');

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

  it('should set request header and send to remote server', function () {
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;
      var headers = body.headers;

      assert.equal('Test_Case', headers.from);
      assert.equal('2018-03-30', headers.date);
    });
  });

  // TODO array value and values are joined together with ', '
  // see: https://nodejs.org/dist/latest-v6.x/docs/api/http.html#http_message_headers
});

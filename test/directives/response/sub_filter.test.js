var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - sub_filter', function () {
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

  it('should replace the matched string to new string', function () {
    // directive: sub_filter 'This is' 'That are';
    // content: This is some test text for hiproxy TEST Case. Only for test.
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;
      var str = body.resString;

      assert.equal('That are some test text for hiproxy TEST Case. Only for test.', str);
    });
  });

  // it('should replace ALL the matched strin', function () {
  //   // directive: sub_filter 'is' 'are' g;
  //   // content: This is some test text for hiproxy TEST Case. Only for test.
  //   return request({
  //     uri: 'http://hiproxy.org/g/',
  //     proxy: 'http://127.0.0.1:8848',
  //     json: true
  //   }).then(function (res) {
  //     var body = res.body;
  //     var str = body.resString;

  //     assert.equal('Thare are some test text for hiproxy TEST Case. Only for test.', str);
  //   });
  // });

  it('should remove the `Last-Modified` header', function () {
    // directive: sub_filter 'This is' 'That are';
    // content: This is some test text for hiproxy TEST Case. Only for test.
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      assert.equal(undefined, res.response.headers['last-modified']);
    });
  });
});

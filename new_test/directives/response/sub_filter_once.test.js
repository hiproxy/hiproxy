var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - sub_filter_once', function () {
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

  it('should replace the matched string ONCE', function () {
    // directive:
    // sub_filter 'is' 'are';
    // sub_filter_once on;
    // content: This is some test text for hiproxy TEST Case. Only for test.
    return request({
      uri: 'http://hiproxy.org/once/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;
      var str = body.resString;

      assert.equal('Thare is some test text for hiproxy TEST Case. Only for test.', str);
    });
  });

  it('should replace the matched string ONCE by default', function () {
    // directive:
    // sub_filter 'is' 'are';
    // content: This is some test text for hiproxy TEST Case. Only for test.
    return request({
      uri: 'http://hiproxy.org/once_def/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;
      var str = body.resString;

      assert.equal('Thare is some test text for hiproxy TEST Case. Only for test.', str);
    });
  });

  it('should replace ALL the matched string when `sub_filter_once` is `off`', function () {
    // directive:
    // sub_filter 'is' 'are';
    // sub_filter_once off;
    // content: This is some test text for hiproxy TEST Case. Only for test.
    return request({
      uri: 'http://hiproxy.org/all/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;
      var str = body.resString;

      assert.equal('Thare are some test text for hiproxy TEST Case. Only for test.', str);
    });
  });

  it('should ignore the invalid `sub_filter_once` value', function () {
    // directive:
    // sub_filter 'is' 'are';
    // sub_filter_once false;
    // content: This is some test text for hiproxy TEST Case. Only for test.
    return request({
      uri: 'http://hiproxy.org/invalid/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;
      var str = body.resString;

      assert.equal('Thare is some test text for hiproxy TEST Case. Only for test.', str);
    });
  });
});

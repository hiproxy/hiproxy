var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - proxy_replace_body', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'body.rewrite');

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

  it('should replace the matched content ONCE and NOT ignore case by default', function () {
    // proxy_replace_body 'beijing' 'wuhan';
    // proxy_replace_body 'admin@hiproxy.org' 'master@hiproxy.org';
    return request({
      uri: 'http://hiproxy.org/replace_body/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      body: {
        city: 'BeiJing',
        location: 'beijing',
        from: 'admin@hiproxy.org',
        address: 'haidian, beijing'
      },
      json: true
    }).then(function (res) {
      var body = res.body.body;

      assert.deepEqual(
        {city: 'BeiJing', location: 'wuhan', from: 'master@hiproxy.org', address: 'haidian, beijing'},
        body
      );
    });
  });

  it('should replace ALL the matched content', function () {
    // proxy_replace_body 'beijing' 'wuhan' g;
    return request({
      uri: 'http://hiproxy.org/replace_body_global/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      body: {
        location: 'beijing',
        from: 'admin@hiproxy.org',
        address: 'haidian, beijing'
      },
      json: true
    }).then(function (res) {
      var body = res.body.body;

      assert.deepEqual({location: 'wuhan', from: 'admin@hiproxy.org', address: 'haidian, wuhan'}, body);
    });
  });

  it('should replace the matched content and ignore case', function () {
    // proxy_replace_body 'beijing' 'wuhan' i;
    return request({
      uri: 'http://hiproxy.org/replace_body_ignore/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      body: {
        location: 'BeiJing',
        from: 'admin@hiproxy.org',
        address: 'haidian, beijing'
      },
      json: true
    }).then(function (res) {
      var body = res.body.body;

      assert.deepEqual({location: 'wuhan', from: 'admin@hiproxy.org', address: 'haidian, beijing'}, body);
    });
  });

  it('should replace ALL the matched content AND ignore case', function () {
    // proxy_replace_body 'beijing' 'wuhan' gi;
    return request({
      uri: 'http://hiproxy.org/replace_body_global_ignore/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      body: {
        location: 'BeiJing',
        from: 'admin@hiproxy.org',
        address: 'haidian, beijing'
      },
      json: true
    }).then(function (res) {
      var body = res.body.body;

      assert.deepEqual({location: 'wuhan', from: 'admin@hiproxy.org', address: 'haidian, wuhan'}, body);
    });
  });

  it('should use empty flag when user specify a invalid flag', function () {
    // proxy_replace_body 'beijing' 'wuhan' sgi;
    return request({
      uri: 'http://hiproxy.org/replace_body_default_flag/',
      proxy: 'http://127.0.0.1:8848',
      method: 'POST',
      body: {
        location: 'BeiJing',
        from: 'admin@hiproxy.org',
        address: 'haidian, beijing'
      },
      json: true
    }).then(function (res) {
      var body = res.body.body;

      assert.deepEqual({
        location: 'BeiJing',
        from: 'admin@hiproxy.org',
        address: 'haidian, wuhan'
      }, body);
    });
  });
});

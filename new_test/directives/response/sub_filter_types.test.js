var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - sub_filter_types', function () {
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

  it('should replace all file types by default (use json to test)', function () {
    // sub_filter 'spec_type' 'SPCE_TYPE';
    return request({
      uri: 'http://hiproxy.org/spec_type/?contentType=' + encodeURI('application/json'),
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;

      assert.equal('/SPCE_TYPE/?contentType=application/json', body.url);
      assert.equal('application/json', res.response.headers['content-type']);
    });
  });

  it('should replace all file types by default (use html to test)', function () {
    // sub_filter 'spec_type' 'SPCE_TYPE';
    return request({
      uri: 'http://hiproxy.org/spec_type/?contentType=' + encodeURI('text/html'),
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;

      assert.equal('/SPCE_TYPE/?contentType=text/html', body.url);
      assert.equal('text/html', res.response.headers['content-type']);
    });
  });

  it('should NOT replace when the specified types NOT contains the original type', function () {
    // proxy_pass http://127.0.0.1:6789/;
    // sub_filter_types text/html text/css;
    // sub_filter '"url":"/"' '"url":"/a/b/c/d"';
    return request({
      uri: 'http://hiproxy.org/should_not_replace/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;

      assert.equal('/', body.url);
      assert.equal('application/json', res.response.headers['content-type']);
    });
  });

  it('should NOT replace when the specified types contains *', function () {
    // proxy_pass http://127.0.0.1:6789/;
    // sub_filter_types text/html text/css *;
    // sub_filter '"url":"/"' '"url":"/a/b/c/d"';
    return request({
      uri: 'http://hiproxy.org/should_replace/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;

      assert.equal('/a/b/c/d', body.url);
      assert.equal('application/json', res.response.headers['content-type']);
    });
  });

  it('should replace when the specified types contains the original type', function () {
    // proxy_pass http://127.0.0.1:6789/?contentType=text/css;
    // sub_filter_types text/html text/css;
    // sub_filter '"url":"/?contentType=text/css"' '"url":"/a/b/c/d"';
    return request({
      uri: 'http://hiproxy.org/css/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      var body = JSON.parse(res.body);

      assert.equal('/a/b/c/d', body.url);
      assert.equal('text/css', res.response.headers['content-type']);
    });
  });
});

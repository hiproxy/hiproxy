var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - proxy_method', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'method.rewrite');

  before(function () {
    testServer.listen(6789);
    proxyServer = new Proxy({
      httpPort: 8848
    });
    global.log = proxyServer.logger;

    proxyServer.addRewriteFile(rewriteFile);
    proxyServer.start();
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  it('should change GET to POST', function () {
    return request({
      uri: 'http://hiproxy.org/get_to_post/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;
      assert.equal('POST', body.method);
    });
  });

  it('should change GET to POST and pass the original query string', function () {
    return request({
      uri: 'http://hiproxy.org/get_to_post/?type=get',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;
      assert.equal('POST', body.method);
      assert.equal('get', body.query.type);
    });
  });

  it('should change GET to POST and pass the body(JSON)', function () {
    return request({
      uri: 'http://hiproxy.org/get_to_post_body_json/?type=get',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;
      assert.equal('POST', body.method);
      assert.equal('get', body.query.type);
      assert.deepEqual({ package: 'hiproxy', ver: 'v2.0.0' }, body.body);
    });
  });

  it('should change GET to POST and pass the body(Form)', function () {
    return request({
      uri: 'http://hiproxy.org/get_to_post_body_form/?type=get',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;
      assert.equal('POST', body.method);
      assert.equal('get', body.query.type);
      assert.deepEqual({ package: 'hiproxy', ver: 'v2.0.0' }, body.body);
    });
  });

  it('should change POST to GET', function () {
    return request({
      uri: 'http://hiproxy.org/post_to_get/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      method: 'POST'
    }).then(function (res) {
      var body = res.body;
      assert.equal('GET', body.method);
    });
  });

  it('should change POST to GET and pass the original query string', function () {
    return request({
      uri: 'http://hiproxy.org/post_to_get/?type=get',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      method: 'POST'
    }).then(function (res) {
      var body = res.body;
      assert.equal('GET', body.method);
      assert.equal('get', body.query.type);
    });
  });

  // it('should HEAD method works', function () {
  //   return request({
  //     uri: 'http://hiproxy.org/get_to_head/',
  //     proxy: 'http://127.0.0.1:8848',
  //     json: true
  //   }).then(function (res) {
  //     var body = res.body;
  //     console.log(body, res.response.headers);
  //     assert.equal('HEAD', body.method);
  //     assert.equal('get', body.query.type);
  //   });
  // });
});

var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - set_header', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'headers.rewrite');

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
    // set_header From admin@hiproxy.org;
    // set_header User admin;
    // set_header Date 2018-08-08;
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var headers = res.response.headers;

      assert.equal('admin@hiproxy.org', headers.from);
      assert.equal('admin', headers.user);
      // TODO cover default headers
      // assert.equal('2018-08-08', headers.date);
    });
  });

  it('should cover the values ​​if set multiple times', function () {
    // set_header host test.hiproxy.org;
    // set_header host hiproxy.org;

    // set_header from test@hiproxy.org;
    // set_header from admin@hiproxy.org;
    return request({
      uri: 'http://hiproxy.org/over_written_header/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var headers = res.response.headers;

      assert.equal('admin@hiproxy.org', headers.from);
      assert.equal('hiproxy.org', headers.host);
    });
  });

  it('should make a Array when name is `set-cookie`', function () {
    // set_header set-cookie 'uname=zdying';
    // set_header set-cookie 'role=admin';
    return request({
      uri: 'http://hiproxy.org/array_header/',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var headers = res.response.headers;

      assert.deepEqual(['uname=zdying', 'role=admin'], headers['set-cookie']);
    });
  });
});

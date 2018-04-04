var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - set (domain)', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'set.rewrite');

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

  // set $domain h1.hiproxy.org;

  // domain hiproxy.org {
  //   set $domain h2.hiproxy.org;

  //   location /use_location/ {
  //     set $domain h3.hiproxy.org;
  //     echo $domain;
  //   }

  //   location /use_domain/ {
  //     echo $domain;
  //   }
  // }

  // domain doc.hiproxy.org {
  //   location /use_global/ {
  //     echo $domain;
  //   }
  // }

  it('should use variable in domain block (cover global block variable)', function () {
    return request({
      uri: 'http://hiproxy.org/use_domain/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      assert.equal('h2.hiproxy.org', res.body);
    });
  });

  it('should be covered by variable in locatin block', function () {
    return request({
      uri: 'http://hiproxy.org/use_location/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      assert.equal('h3.hiproxy.org', res.body);
    });
  });

  it('should use global variable', function () {
    return request({
      uri: 'http://doc.hiproxy.org/use_global/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      assert.equal('h1.hiproxy.org', res.body);
    });
  });
});

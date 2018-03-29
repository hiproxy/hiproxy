var assert = require('assert');
var path = require('path');

var Proxy = require('../../../src/server');
var testServer = require('../../testServer');

describe('#server - API', function () {
  var proxyServer;

  before(function () {
    testServer.listen(6666);
  });

  after(function () {
    testServer.close();
  });

  it('# start() - should start the HTTP and HTTPS service', function () {
    proxyServer = new Proxy(8850, 10010);
    return proxyServer.start().then(function () {
      assert.equal(true, proxyServer.httpServer.listening);
      assert.equal(true, proxyServer.httpsServer.listening);

      proxyServer.stop();
    });
  });

  it('# stop() - Should stop all the service', function () {
    proxyServer = new Proxy(8850, 10010);
    return proxyServer.start().then(function () {
      proxyServer.stop();

      assert.equal(false, proxyServer.httpServer.listening);
      assert.equal(false, proxyServer.httpsServer.listening);
    });
  });

  it('# restart() - Should restart all the service', function () {
    proxyServer = new Proxy(0, 0);
    return proxyServer.start().then(function () {
      return proxyServer.restart().then(function () {
        assert.equal(true, proxyServer.httpServer.listening);
        assert.equal(true, proxyServer.httpsServer.listening);
      });
    });
  });

  it('# addHostsFile() - Should add hosts config file.', function () {
    var filePath = path.join(__dirname, 'conf', 'hosts');

    proxyServer = new Proxy();
    proxyServer.addHostsFile(filePath);

    var rules = proxyServer.hosts.getHost();

    assert.equal('127.0.0.1', rules['local.hiproxy.org']);
  });

  it('# addRewriteFile() - Should add rewrite config file.', function () {
    var filePath = path.join(__dirname, 'conf', 'rewrite');

    proxyServer = new Proxy();
    proxyServer.addRewriteFile(filePath);

    var rules = proxyServer.rewrite.getRule();

    assert.equal(1, rules['hiproxy.org'].length);
  });

  it('# disableConfFile() - Should disable the config file', function () {
    var hostsFilePath = path.join(__dirname, 'conf', 'hosts');
    var rewriteFilePath = path.join(__dirname, 'conf', 'rewrite');
    var hosts = null;
    var rewrite = null;

    proxyServer = new Proxy();
    proxyServer.addRewriteFile(rewriteFilePath);
    proxyServer.addHostsFile(hostsFilePath);

    hosts = proxyServer.hosts.getHost();
    rewrite = proxyServer.rewrite.getRule();

    assert.equal('127.0.0.1', hosts['local.hiproxy.org']);
    assert.equal(1, rewrite['hiproxy.org'].length);

    proxyServer.disableConfFile('hosts', hostsFilePath);
    proxyServer.disableConfFile('rewrite', rewriteFilePath);

    hosts = proxyServer.hosts.getHost();
    rewrite = proxyServer.rewrite.getRule();

    assert.equal(undefined, hosts['local.hiproxy.org']);
    assert.equal(undefined, rewrite['hiproxy.org']);
  });

  it('# enableConfFile() - Should enable the config file', function () {
    var hostsFilePath = path.join(__dirname, 'conf', 'hosts');
    var rewriteFilePath = path.join(__dirname, 'conf', 'rewrite');
    var hosts = null;
    var rewrite = null;

    proxyServer = new Proxy();
    proxyServer.addRewriteFile(rewriteFilePath);
    proxyServer.addHostsFile(hostsFilePath);

    proxyServer.disableConfFile('hosts', hostsFilePath);
    proxyServer.disableConfFile('rewrite', rewriteFilePath);

    proxyServer.enableConfFile('hosts', hostsFilePath);
    proxyServer.enableConfFile('rewrite', rewriteFilePath);

    hosts = proxyServer.hosts.getHost();
    rewrite = proxyServer.rewrite.getRule();

    assert.equal('127.0.0.1', hosts['local.hiproxy.org']);
    assert.equal(1, rewrite['hiproxy.org'].length);
  });

  it('# addRule() - Should add the config rules to hiproxy server', function () {
    proxyServer = new Proxy();

    proxyServer.addRule('hosts', '127.0.0.1 doc.hiproxy.org');
    proxyServer.addRule('rewrite', 'zh.hiproxy.org => { location / { echo "test"; } }');

    var hosts = proxyServer.hosts.getHost();
    var rewrite = proxyServer.rewrite.getRule();

    assert.equal('127.0.0.1', hosts['doc.hiproxy.org']);
    assert.equal(1, rewrite['zh.hiproxy.org'].length);
  });

  it('# addCallback() - Should add callback functions to `hiproxy.options`', function () {
    proxyServer = new Proxy();

    proxyServer.addCallback('onBeforeResponse', function () {}, function () {});
    proxyServer.addCallback('onAnExistCallbackName', function () {});

    var options = proxyServer.options;

    assert.equal(2, options.onBeforeResponse.length);
    assert.equal(undefined, options.onAnExistCallbackName);

    proxyServer.addCallback('onBeforeResponse', function () {}, function () {});
    assert.equal(4, options.onBeforeResponse.length);
  });
});

var assert = require('assert');
var path = require('path');
var Logger = require('../../src/helpers/logger');
require('colors');

global.args = {};
global.log = new Logger();

describe('#auto generate ssl certificate', function () {
  var proxyServer = null;
  before(function () {
    var Proxy = require('../../src/index');
    proxyServer = new Proxy(8859, 10086);
    proxyServer.addRewriteFile(path.join(__dirname, 'rewrite'));
    proxyServer.start();
  });

  it('should auto generate certificate', function (done) {
    var https = require('https');
    var options = {
      host: '127.0.0.1',
      port: 10086,
      path: 'https://example.io/',
      method: 'GET',
      headers: {
        'Host': 'example.io'
      },
      rejectUnauthorized: false
    };

    var req = https.request(options, function (res) {
      var certInfo = res.connection.getPeerCertificate(true);
      var subject = certInfo.subject;
      var issuer = certInfo.issuer;

      // subject
      // {
      //   CN: 'example.io',
      //   C: 'CN',
      //   ST: 'Bei Jing',
      //   L: 'Hai Dian',
      //   O: 'Hiproxy',
      //   OU: 'Development'
      // }
      // issuer
      // {
      //   CN: 'Hiproxy Custom CA',
      //   C: 'CN',
      //   ST: 'Bei Jing',
      //   L: 'Hai Dian',
      //   O: 'Hiproxy',
      //   OU: 'Development'
      // }
      assert(subject.CN, 'example.io');
      assert(issuer.CN, 'Hiproxy Custom CA');
      done();
    });

    req.on('error', function (err) {
      done(err);
    });

    req.end();
  });

  after(function () {
    proxyServer.stop();
  });
});

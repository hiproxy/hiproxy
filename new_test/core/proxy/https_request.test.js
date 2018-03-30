var path = require('path');
var https = require('https');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#proxy - HTTPS request proxy', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'rewrite');

  var certFingerprint = '';

  before(function () {
    testServer.listen(6789);
    proxyServer = new Proxy(8848, 1111);
    global.log = proxyServer.logger;

    proxyServer.addRewriteFile(rewriteFile);
    proxyServer.start();
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  it('should proxy HTTPS requests', function () {
    return request({
      uri: 'https://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      strictSSL: false
    }).then(function (res) {
      var body = res.body;
      assert.equal('/', body.url);
      assert.equal('GET', body.method);
    });
  });

  it('should TUNNEL proxy works', function () {
    return request({
      uri: 'https://127.0.0.1:1111/',
      proxy: 'http://127.0.0.1:8848',
      strictSSL: false
    }).then(function (res) {
      var body = res.body;
      var response = res.response;

      assert.equal('the man in the middle page: /', body);
      assert.equal(200, response.statusCode);
    });
  });

  it('should generate the certificate corresponding to the domain name automatically', function (done) {
    var options = {
      host: '127.0.0.1',
      port: 1111,
      path: 'https://hiproxy.org/',
      method: 'GET',
      headers: {
        'Host': 'hiproxy.org'
      },
      rejectUnauthorized: false
    };

    var req = https.request(options, function (res) {
      var certInfo = res.connection.getPeerCertificate(true);
      var subject = certInfo.subject;
      var issuer = certInfo.issuer;

      certFingerprint = certInfo.fingerprint;

      // console.log(certInfo);

      // subject
      // {
      //   CN: 'hiproxy.org',
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
      assert(subject.CN, 'hiproxy.org');
      assert(issuer.CN, 'Hiproxy Custom CA');
      done();
    });

    req.on('error', function (err) {
      done(err);
    });

    req.end();
  });

  it('should use a cached certificate', function (done) {
    var options = {
      host: '127.0.0.1',
      port: 1111,
      path: 'https://hiproxy.org/',
      method: 'GET',
      headers: {
        'Host': 'hiproxy.org'
      },
      rejectUnauthorized: false,
      // disable certificate cache
      agent: false
    };

    var req = https.request(options, function (res) {
      var certInfo = res.connection.getPeerCertificate(true);

      assert.equal(certFingerprint, certInfo.fingerprint);
      done();
    });

    req.on('error', function (err) {
      done(err);
    });

    req.end();
  });
});

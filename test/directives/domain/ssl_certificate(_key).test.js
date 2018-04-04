var path = require('path');
var https = require('https');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');

describe('#directives - ssl_certificate | ssl_certificate_key', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'cert.rewrite');

  before(function () {
    testServer.listen(6789);
    proxyServer = new Proxy(8848, 8849);
    global.log = proxyServer.logger;

    proxyServer.addRewriteFile(rewriteFile);
    proxyServer.start();
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  it('should use the specitied certificate', function () {
    // ssl_certificate     ../cert/hiproxy.org.pem;
    // ssl_certificate_key ../cert/hiproxy.org.key;
    return requestCertAndBody('https://doc.hiproxy.org/', 8849, 'doc.hiproxy.org').then(function (res) {
      var cert = res.cert;
      var body = JSON.parse(res.body);

      checkCert(cert);

      assert.ok('/doc/', body.url);
    });
  });

  it('should works when use absolute path', function () {
    var rewrite = [
      'domain test.hiproxy.org {',
      '  ssl_certificate     ' + path.join(__dirname, 'cert', 'hiproxy.org.crt'),
      '  ssl_certificate_key ' + path.join(__dirname, 'cert', 'hiproxy.org.key'),
      '  location / {',
      '    alias ' + path.join(__dirname, 'files', '/'),
      '  }',
      '}'
    ];

    proxyServer.addRule('rewrite', rewrite.join('\n'));

    return requestCertAndBody('https://test.hiproxy.org/data.json', 8849, 'test.hiproxy.org').then(function (res) {
      var cert = res.cert;
      var body = JSON.parse(res.body);

      checkCert(cert);

      assert.deepEqual({
        'ret': true,
        'data': {
          'users': [
            {'name': 'zdying', 'location': 'beijing'},
            {'name': 'tom', 'location': 'wuhan'}
          ]
        }
      }, body);
    });
  });

  it('should work with `echo`', function () {
    return requestCertAndBody('https://doc.hiproxy.org/echo/', 8849, 'doc.hiproxy.org').then(function (res) {
      var cert = res.cert;
      var body = res.body;

      checkCert(cert);

      assert.equal('echo content', body);
    });
  });

  it('should work with `send_file`', function () {
    return requestCertAndBody('https://doc.hiproxy.org/send_file/', 8849, 'doc.hiproxy.org').then(function (res) {
      var cert = res.cert;
      var body = JSON.parse(res.body);

      checkCert(cert);

      assert.deepEqual({
        'ret': true,
        'data': {
          'users': [
            {'name': 'zdying', 'location': 'beijing'},
            {'name': 'tom', 'location': 'wuhan'}
          ]
        }
      }, body);
    });
  });

  it('should work with `alias`', function () {
    return requestCertAndBody('https://doc.hiproxy.org/alias/data.json', 8849, 'doc.hiproxy.org').then(function (res) {
      var cert = res.cert;
      var body = JSON.parse(res.body);

      checkCert(cert);

      assert.deepEqual({
        'ret': true,
        'data': {
          'users': [
            {'name': 'zdying', 'location': 'beijing'},
            {'name': 'tom', 'location': 'wuhan'}
          ]
        }
      }, body);
    });
  });
});

function requestCertAndBody (url, proxyPort, host) {
  var options = {
    host: '127.0.0.1',
    port: proxyPort,
    path: url,
    method: 'GET',
    headers: {
      'Host': host
    },
    agent: false,
    rejectUnauthorized: false
  };

  return new Promise(function (resolve, reject) {
    var req = https.request(options, function (res) {
      var certInfo = res.connection.getPeerCertificate(true);

      var data = '';

      res.on('data', function (chunk) {
        data += chunk.toString();
      });

      res.on('end', function (chunk) {
        resolve({
          body: data,
          cert: certInfo
        });
      });

      res.on('error', function (err) {
        reject(err);
      });
    });

    req.on('error', function (err) {
      reject(err);
    });

    req.end();
  });
}

function checkCert (cert) {
  // subject:
  // { C: 'CN',
  //   ST: 'BeiJing',
  //   L: 'HaiDian',
  //   O: 'hiproxy dev',
  //   emailAddress: 'zdying@live.com' },
  // issuer:
  // { C: 'CN',
  //   ST: 'BeiJing',
  //   L: 'BeiJing',
  //   O: 'hiproxy dev',
  //   OU: 'dev',
  //   CN: 'hiproxy.org',
  //   emailAddress: 'zdying@live.com' },
  // subjectaltname: 'DNS:*.hiproxy.org, DNS:localhost',

  assert.equal(undefined, cert.subject.CN);
  assert.equal('hiproxy.org', cert.issuer.CN);
  assert.equal('DNS:*.hiproxy.org, DNS:localhost', cert.subjectaltname);
}

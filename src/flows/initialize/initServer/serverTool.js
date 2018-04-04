/**
 * @file hiproxy server tool
 * @author zdying
 */
'use strict';

var certTool = require('../../../helpers/certTool');

module.exports = {
  create: function (port, isSSL, rewrite) {
    return isSSL ? this._createHTTPSServer(port, rewrite) : this._createHTTPServer(port, rewrite);
  },

  _createHTTPServer: function (port, rewrite) {
    return new Promise(function (resolve, reject) {
      var server = require('http').createServer().listen(port);
      server.keepAliveTimeout = 0;
      server
        .on('listening', function () {
          resolve(server);
        })
        .on('error', function (err) {
          reject(err);
        });
    });
  },

  _createHTTPSServer: function (port, rewrite) {
    var fs = require('fs');
    var tls = require('tls');

    // get default local certificate
    return certTool.createCertificate('localhost', null, {
      subjectaltname: 'IP:127.0.0.1,DNS:localhost'
    }).then(function (defaultCert) {
      var option = {
        key: defaultCert.privateKeyPem,
        cert: defaultCert.certificatePem,
        SNICallback: function (domain, cb) {
          var rewriteRules = rewrite.getRule();
          var domainRewriteRule = rewriteRules[domain] || [];
          var certObj = domainRewriteRule.length > 0 && domainRewriteRule[0].variables;

          if (certObj && certObj.$ssl_certificate_key && certObj.$ssl_certificate) {
            // 如果配置了证书，使用配置的证书
            // TODO 缓存证书内容，避免每次都去读取
            cb(null, tls.createSecureContext({
              key: fs.readFileSync(certObj.$ssl_certificate_key),
              cert: fs.readFileSync(certObj.$ssl_certificate)
            }));
            log.debug('SNI callback [', domain.bold.green, ']:', JSON.stringify(certObj));
          } else {
            // 如果没有配置证书，自动生成证书
            certTool.createCertificate(domain, null).then(function (cert) {
              cb(null, tls.createSecureContext({
                key: cert.privateKeyPem, // fs.readFileSync(defaultCert.key),
                cert: cert.certificatePem // fs.readFileSync(defaultCert.cert)
              }));
            });
            log.warn('No keys/certificates for domain requested:', domain.bold.yellow);
          }
        }
      };

      return new Promise(function (resolve, reject) {
        var server = require('https').createServer(option).listen(port);
        server.keepAliveTimeout = 0;
        server
          .on('listening', function () {
            resolve(server);
          })
          .on('error', function (err) {
            reject(err);
          });
      });
    });
  }
};

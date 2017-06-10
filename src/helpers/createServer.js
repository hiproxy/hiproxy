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
    var path = require('path');
    var fs = require('fs');
    var tls = require('tls');

    var defaultCert = {
      key: path.resolve(__dirname, '../../ssl/cert/localhost.key'),
      cert: path.resolve(__dirname, '../../ssl/cert/localhost.crt')
    };
    var option = {
      key: fs.readFileSync(defaultCert.key),
      cert: fs.readFileSync(defaultCert.cert),
      SNICallback: function (domain, cb) {
        var rewriteRules = rewrite.getRule();
        var domainRewriteRule = rewriteRules[domain] || [];
        var certObj = domainRewriteRule.length > 0 && domainRewriteRule[0].props;

        if (certObj && certObj.sslCertificateKey && certObj.sslCertificate) {
          cb(null, tls.createSecureContext({
            key: fs.readFileSync(certObj.sslCertificateKey),
            cert: fs.readFileSync(certObj.sslCertificate)
          }));
          log.debug('SNI callback [', domain.bold.green, ']:', JSON.stringify(certObj));
        } else {
          cb(null, tls.createSecureContext({
            key: fs.readFileSync(defaultCert.key),
            cert: fs.readFileSync(defaultCert.cert)
          }));
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
  }
};

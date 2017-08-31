var certTool = require('../cert');

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
    var self = this;

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
        var certObj = domainRewriteRule.length > 0 && domainRewriteRule[0].variables;

        if (certObj && certObj.ssl_certificate_key && certObj.ssl_certificate) {
          // 如果配置了证书，使用配置的证书
          // TODO 缓存证书内容，避免每次都去读取
          cb(null, tls.createSecureContext({
            key: fs.readFileSync(certObj.ssl_certificate_key),
            cert: fs.readFileSync(certObj.ssl_certificate)
          }));
          log.debug('SNI callback [', domain.bold.green, ']:', JSON.stringify(certObj));
        } else {
          // 如果没有配置证书，自动生成证书
          self._getCertInfoByHostsName(domain, function (err, certInfo) {
            if (!err) {
              log.debug('The original certificate info for `' + domain + '`');
              log.detail('Original certificate info:', JSON.stringify(certInfo));
            } else {
              log.warn('Get the original certificate info for `' + domain + '` failed', err);
            }

            var cert = certTool.createCertificate(domain, null, certInfo);

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
  },

  /**
   * 获取线上证书的信息
   */
  _getCertInfoByHostsName: function (hostname, callback) {
    var https = require('https');
    var options = {
      host: hostname,
      port: 443,
      method: 'GET'
    };

    var req = https.request(options, function (res) {
      callback(null, res.connection.getPeerCertificate());
    });

    req.on('error', function (err) {
      callback(err, null);
    });

    req.end();
  }
};

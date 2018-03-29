/**
 * @file TLS certificate tools.
 * @author zdying
 */

'use strict';

var fs = require('fs');
var https = require('https');
var path = require('path');
var forge = require('node-forge');
var pki = forge.pki;
var md5 = forge.md.md5;
var mkdirp = require('./mkdirp');
var dirtool = require('../helpers/dirTool');
var certDir = dirtool.getCertificateDir();
var defaultAttrs = [
  {
    name: 'countryName',
    value: 'CN'
  },
  {
    name: 'stateOrProvinceName',
    value: 'Bei Jing'
  },
  {
    name: 'localityName',
    value: 'Hai Dian'
  },
  {
    name: 'organizationName',
    value: 'Hiproxy'
  },
  {
    name: 'organizationalUnitName',
    value: 'Development'
  }
];
var DEFAULT_CA_NAME = 'Hiproxy Custom CA';
var _cache = {};

mkdirp(certDir);

module.exports = {
  getCACertificate: function (CAName) {
    CAName = CAName || DEFAULT_CA_NAME;
    var fileName = getFileNameByCN(CAName);
    var certInfo = this.getCertificateByFileName(fileName);
    if (certInfo) {
      return certInfo;
    } else {
      log.debug('create new CA certificate, CA name:', CAName);
      return this._createCertificate(null, CAName, {isCa: true});
    }
  },

  getCertificateByFileName: function (fileName) {
    var filePath = path.join(certDir, fileName);
    var keyPath = filePath + '.key';
    var crtPath = filePath + '.pem';
    var keyContent = '';
    var crtContent = '';
    var certificate = null;
    var privateKey = null;

    if (fs.existsSync(keyPath) && fs.existsSync(crtPath)) {
      try {
        keyContent = fs.readFileSync(keyPath);
        crtContent = fs.readFileSync(crtPath);
        certificate = pki.certificateFromPem(crtContent);
        privateKey = pki.privateKeyFromPem(keyContent);

        log.debug('get certificate file:', [keyPath, crtPath]);

        return {
          privateKey: privateKey,
          publicKey: certificate.publicKey,
          certificate: certificate,
          certificatePem: crtContent,
          privateKeyPem: keyContent
        };
      } catch (e) {
        return null;
      }
    } else {
      log.debug('certificate file:', [keyPath, crtPath], 'not exists.');
      return null;
    }
  },

  createCertificate: function (domain, CAName, certInfo) {
    var promise = _cache[domain];
    var _certInfoPromise = null;
    var hasCertInfo = certInfo && typeof certInfo === 'object';
    var self = this;

    if (!promise) {
      _certInfoPromise = hasCertInfo ? Promise.resolve(certInfo) : this.getCertInfoByHostsName(domain);
      promise = _certInfoPromise.then(function (certInfo) {
        var caCert = self.getCACertificate(CAName);
        var CN = (certInfo.subject && certInfo.subject.CN) || domain;
        var fileName = getFileNameByCN(CN);
        var cachedCert = self.getCertificateByFileName(fileName);
        var cert = cachedCert;

        if (!cachedCert) {
          log.debug('No cached cetrificate', CN ? 'CN:' + CN : '');
          cert = self._createCertificate(caCert, domain, null, certInfo);
        } else {
          log.debug('Use cached certificate', CN ? 'CN:' + CN : '');
        }

        return cert;
      });
      _cache[domain] = promise;
    } else {
      log.debug(domain, 'certificate is created or creating, return the cached promise');
    }

    return promise;
  },

  _createCertificate: function (caCert, domain, options, certInfo) {
    log.debug('Generate new certificate:', domain);
    // Generating 1024-bit key-pair...'
    var keys = pki.rsa.generateKeyPair(1024);
    // Creating self-signed certificate...
    var cert = pki.createCertificate();
    // unique id
    var uid = md5.create().update(domain).digest().toHex();

    options = options || {};

    var days = options.days || 365;
    var isCa = options.isCa || false;
    var subject = certInfo ? certInfo.subject || {} : {};
    var hasSubjectAltName = certInfo && typeof certInfo.subjectaltname === 'string';
    var subjectaltname = hasSubjectAltName ? certInfo.subjectaltname.split(/,\s*/) : ['DNS:' + domain];
    var attributes = options.attributes || [
      {name: 'commonName', value: subject.CN || domain}
    ].concat(defaultAttrs);
    var has127 = false;

    var extensions = options.extensions || [
      {name: 'basicConstraints', cA: isCa}
    ];
    var san = {
      name: 'subjectAltName',
      altNames: [
        {
          type: 6, // URI
          value: 'http://hiproxy.org/'
        }
      ]
    };

    subjectaltname.forEach(function (sn) {
      var info = sn.split(':');
      var map = {IP: 7, DNS: 2};
      var type = map[info[0]];
      var obj = {};

      if (type) {
        obj.type = type;
        obj[type === 7 ? 'ip' : 'value'] = info[1];
        san.altNames.push(obj);

        if (info[1] === '127.0.0.1') {
          has127 = true;
        }
      }
    });

    if (domain === 'localhost' && !has127) {
      san.altNames.push({
        type: 7,
        ip: '127.0.0.1'
      });
    }

    if (!isCa) {
      extensions.push(san);
    }

    cert.publicKey = keys.publicKey;
    cert.serialNumber = uid;
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setDate(cert.validity.notBefore.getDate() + days);

    cert.setSubject(attributes);
    cert.setIssuer(caCert ? caCert.certificate.subject.attributes : attributes);
    cert.setExtensions(extensions);

    // sign certificate
    cert.sign((caCert || keys).privateKey, forge.md.sha256.create());

    // PEM-format keys and cert
    // var pem = {
    //   privateKey: pki.privateKeyToPem(keys.privateKey),
    //   publicKey: pki.publicKeyToPem(keys.publicKey),
    //   certificate: pki.certificateToPem(cert)
    // };

    var fileName = getFileNameByCN(subject.CN || domain);
    writeFile(fileName + '.key', certDir, pki.privateKeyToPem(keys.privateKey));
    writeFile(fileName + '.pem', certDir, pki.certificateToPem(cert));

    return {
      privateKey: keys.privateKey,
      publicKey: keys.publicKey,
      certificate: cert,
      privateKeyPem: pki.privateKeyToPem(keys.privateKey),
      publicKeyPem: pki.publicKeyToPem(keys.publicKey),
      certificatePem: pki.certificateToPem(cert)
    };
  },

  /**
   * 获取线上证书的信息
   */
  getCertInfoByHostsName: function (hostname, callback) {
    return new Promise(function (resolve, reject) {
      var options = {
        host: hostname,
        port: 443,
        method: 'GET'
      };

      var req = https.request(options, function (res) {
        resolve(res.connection.getPeerCertificate());
      });

      req.on('error', function (err) {
        log.error('get certificate info for', hostname, 'error: ', err);
        resolve({});
      });

      req.end();
    });
  }
};

/* istanbul ignore next */
function writeFile (fileName, basedir, content) {
  fs.writeFile(path.join(basedir, fileName), content.replace(/\r\n/g, '\n'), function (err) {
    if (err) {
      console.log(err);
    }
  });
}

/* istanbul ignore next */
function getFileNameByCN (CN) {
  return CN.replace(/\s+/g, '_').replace(/\*\./, '');
}

// test
// var log = {debug: function(){}};
// var tool = module.exports;
// var cert = tool.createCertificate('www.fuck-you.com');
// console.log(cert);

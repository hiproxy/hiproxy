/**
 * @file TLS certificate tools.
 * @author zdying
 */

'use strict';

var fs = require('fs');
var os = require('os');
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
var DEFAULT_CA_NAME = 'Hiproxy-Custom-CA-' + os.hostname().replace(/[._]/g, '-');
var _cache = {};

mkdirp(certDir);

module.exports = {
  /**
   * 获取CA证书，优选读取已经存在的证书，如果不存在会自动创建
   * @param {String} [CAName] CA名称 
   */
  getCACertificate: function(CAName) {
    CAName = CAName || DEFAULT_CA_NAME;
    var fileName = getFileNameByCN(CAName);
    var certInfo = this.getCertificateByFileName(fileName);
    if (certInfo) {
      return certInfo;
    } else {
      log.debug('create new CA certificate, CA name:', CAName);
      var attrs = [
        {
          name: 'commonName',
          value: CAName
        }
      ].concat(defaultAttrs);
      var exts = [
        {
          name: 'basicConstraints',
          critical: true,
          cA: true
        },
        {
          name: 'keyUsage',
          critical: true,
          keyCertSign: true
        },
        {
          name: 'subjectKeyIdentifier'
        }
      ];
      return this._createCert(attrs, attrs, exts, null, CAName);
    }
  },

  /**
   * 创建域名证书
   * @param {String} domain 
   * @param {String} CAName 
   * @param {Cert} certInfo 
   */
  getDomainCertificate: function(domain, CAName, certInfo) {
    var promise = _cache[domain];
    var _certInfoPromise = null;
    var hasCertInfo = certInfo && typeof certInfo === 'object';
    var self = this;

    if (!promise) {
      _certInfoPromise = hasCertInfo ? Promise.resolve(certInfo) : this.getCertInfoByHostsName(domain);
      
      promise = _certInfoPromise.then(function(certInfo) {
        var caCert = self.getCACertificate(CAName);
        var CN = (certInfo.subject && certInfo.subject.CN) || domain;
        var fileName = getFileNameByCN(CN);
        var cachedCert = self.getCertificateByFileName(fileName);
        var cert = cachedCert;

        if (!cachedCert) {
          log.debug('No cached cetrificate', CN ? 'CN:' + CN : '');
          // cert = self._createCertificate(caCert, domain, null, certInfo);
          cert = self._createDomainCert(caCert, domain, certInfo);
        } else {
          log.debug('Use cached certificate', CN ? 'CN:' + CN : '');
        }

        return cert;
      });
      _cache[domain] = promise;
    } else {
      log.debug(
        domain,
        'certificate is created or creating, return the cached promise'
      );
    }

    return promise;
  },

    /**
   * 读取证书文件，转换成证书
   * @param {String} fileName 文件名称
   */
  getCertificateByFileName: function(fileName) {
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

  /**
   * 获取线上证书的信息
   */
  getCertInfoByHostsName: function(hostname, callback) {
    return new Promise(function(resolve, reject) {
      var options = {
        host: hostname,
        port: 443,
        method: 'GET'
      };

      var req = https.request(options, function(res) {
        resolve(res.connection.getPeerCertificate());
      });

      req.on('error', function(err) {
        log.error('get certificate info for', hostname, 'error: ', err);
        resolve({});
      });

      req.end();
    });
  },

  /**
   * 创建证书（具体是CA还是普通域名证书，这里不关心，取决于传递的参数）
   * 证书过期时间为100年
   * @param {Array} attrs 
   * @param {Array} issuers 
   * @param {Array} exts 
   * @param {Cert}  caCert 
   * @param {String} domain 
   */
  _createCert(attrs, issuers, exts, caCert, domain) {
    log.debug('Generate new certificate:', domain);

    var keys = pki.rsa.generateKeyPair(2048);
    var cert = pki.createCertificate();
    var certId = md5.create().update(domain).digest().toHex();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = certId;
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(
      cert.validity.notAfter.getFullYear() + 100
    );

    cert.setSubject(attrs);
    cert.setIssuer(issuers);
    cert.setExtensions(exts);
    cert.sign((caCert || keys).privateKey, forge.md.sha256.create());

    var certPem = pki.certificateToPem(cert);
    var keyPem = pki.privateKeyToPem(keys.privateKey);
    var pubKeyPem = pki.publicKeyToPem(keys.publicKey);

    // fs.writeFile(
    //   '/Users/zdying/.hiproxy/cert/' + domain + '.key',
    //   keyPem,
    //   function() {}
    // );
    // fs.writeFile(
    //   '/Users/zdying/.hiproxy/cert/' + domain + '.pem',
    //   certPem,
    //   function() {}
    // );

    var fileName = getFileNameByCN(domain);
    writeFile(fileName + '.key', certDir, keyPem);
    writeFile(fileName + '.pem', certDir, certPem);

    return {
      privateKey: keys.privateKey,
      publicKey: keys.publicKey,
      certificate: cert,
      privateKeyPem: keyPem,
      publicKeyPem: pubKeyPem,
      certificatePem: certPem
    };
  },

  _createDomainCert(caCert, domain, certInfo) {
    var attrs = [
      {
        name: 'commonName',
        value: domain
      }
    ].concat(defaultAttrs);
    var issuers = caCert.certificate.issuer.attributes;
    var exts = [
      {
        name: 'basicConstraints',
        critical: true,
        cA: false
      },
      {
        name: 'keyUsage',
        critical: true,
        digitalSignature: true,
        contentCommitment: true,
        keyEncipherment: true,
        dataEncipherment: true,
        keyAgreement: true,
        keyCertSign: true,
        cRLSign: true,
        encipherOnly: true,
        decipherOnly: true
      },
      {
        name: 'subjectKeyIdentifier'
      },
      {
        name: 'extKeyUsage',
        serverAuth: true,
        clientAuth: true,
        codeSigning: true,
        emailProtection: true,
        timeStamping: true
      },
      {
        name: 'authorityKeyIdentifier'
      },
      {
        name: 'subjectAltName',
        altNames: [
          {
            type: 6, // URI
            value: 'http://hiproxy.org/'
          }
        ]
      }
    ];

    var sanExt = exts[exts.length - 1];
    var hasSubjectAltName = certInfo && typeof certInfo.subjectaltname === 'string';
    var subjectaltname = hasSubjectAltName ? certInfo.subjectaltname.split(/,\s*/) : ['DNS:' + domain];
    var has127 = false;

    subjectaltname.forEach(function(sn) {
      var info = sn.split(':');
      var map = { IP: 7, DNS: 2 };
      var type = map[info[0]];
      var obj = {};

      if (type) {
        obj.type = type;
        obj[type === 7 ? 'ip' : 'value'] = info[1];
        sanExt.altNames.push(obj);

        if (info[1] === '127.0.0.1') {
          has127 = true;
        }
      }
    });

    if (domain === 'localhost' && !has127) {
      sanExt.altNames.push({
        type: 7,
        ip: '127.0.0.1'
      });
    }

    return this._createCert(attrs, issuers, exts, caCert, domain);
  }
};

/* istanbul ignore next */
function writeFile(fileName, basedir, content) {
  fs.writeFile(
    path.join(basedir, fileName),
    content.replace(/\r\n/g, '\n'),
    function(err) {
      if (err) {
        log.error(err);
      }
    }
  );
}

/* istanbul ignore next */
function getFileNameByCN(CN) {
  return CN.replace(/\s+/g, '_').replace(/\*\./, '');
}

// test
// var log = {debug: function(){}};
// var tool = module.exports;
// var cert = tool.createCertificate('www.fuck-you.com');
// console.log(cert);

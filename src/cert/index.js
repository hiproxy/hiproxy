/**
 * @file TLS certificate tools.
 * @author zdying
 */

'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');
var forge = require('node-forge');
var pki = forge.pki;
var md5 = forge.md.md5;
var homedir = require('os-homedir');
var mkdirp = require('../helpers/mkdirp');
var certDir = path.join(process.env.NPM_TEST ? os.tmpdir() : homedir(), '.hiproxy', 'cert');
var defaultFields = require('./defaultFields');
var DEFAULT_CA_NAME = 'Hiproxy Custom CA';

mkdirp(certDir);

module.exports = {
  getCACertificate: function (CAName) {
    CAName = CAName || DEFAULT_CA_NAME;

    var certInfo = this.getCertificateByFileName(CAName);
    if (certInfo) {
      return certInfo;
    } else {
      log.debug('create new CA certificate, CA name:', CAName);
      return this._createCertificate(null, CAName, {isCa: true});
    }
  },

  getCertificateByFileName: function (fileName) {
    var filePath = path.join(certDir, fileName.replace(/\s+/g, '_'));
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
    var caCert = this.getCACertificate(CAName);
    var CN = (certInfo && certInfo.subject && certInfo.subject.CN) || domain;
    var cachedCert = this.getCertificateByFileName(CN);
    var cert = cachedCert;

    if (!cachedCert) {
      log.debug('No cached cetrificate', CN ? 'CN:' + CN : '');
      cert = this._createCertificate(caCert, domain, null, certInfo);
    } else {
      log.debug('Use cached certificate', CN ? 'CN:' + CN : '');
    }

    return cert;
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
    var subjectaltname = hasSubjectAltName ? certInfo.subjectaltname.split(/,\s+/) : ['DNS:' + domain];
    var attributes = options.attributes || [
      {name: 'commonName', value: subject.CN || domain}
    ].concat(defaultFields.attributes);

    var extensions = options.extensions || [
      {name: 'basicConstraints', cA: isCa}
    ]; // .concat(defaultFields.extensions);
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

      if (type) {
        san.altNames.push({
          type: type,
          value: info[1]
        });
      }
    });

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

    var fileName = (subject.CN || domain).replace(/\s+/g, '_');
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
  }
};

function writeFile (fileName, basedir, content) {
  fs.writeFile(path.join(basedir, fileName), content.replace(/\r\n/g, '\n'), function (err) {
    if (err) {
      console.log(err);
    }
  });
}

// test
// var log = {debug: function(){}};
// var tool = module.exports;
// var cert = tool.createCertificate('www.fuck-you.com');
// console.log(cert);

/**
 * @file TLS certificate tools.
 * @author zdying
 */

'use strict';

var fs = require('fs');
var path = require('path');
var forge = require('node-forge');
var pki = forge.pki;
var md5 = forge.md.md5;
var homedir = require('os-homedir');
var mkdirp = require('../helpers/mkdirp');

var defaultFields = require('./defaultFields');

var DEFAULT_CA_NAME = 'Hiproxy Custom CA';

module.exports = {
  getCACertificate: function (CAName) {
    CAName = CAName || DEFAULT_CA_NAME;

    var certDir = path.join(homedir(), '.hiproxy', 'cert', CAName.replace(/\s+/g, '_'));
    var keyPath = certDir + '.key';
    var crtPath = certDir + '.pem';
    var keyContent = '';
    var crtContent = '';
    var certificate = null;
    var privateKey = null;

    if (fs.existsSync(keyPath) && fs.existsSync(crtPath)) {
      keyContent = fs.readFileSync(keyPath);
      crtContent = fs.readFileSync(crtPath);
      certificate = pki.certificateFromPem(crtContent);
      privateKey = pki.privateKeyFromPem(keyContent);

      log.debug('ca certificate:', [keyPath, crtPath]);

      return {
        privateKey: privateKey,
        publicKey: certificate.publicKey,
        certificate: certificate
      };
    } else {
      log.debug('create new CA certificate, CA name:', CAName);
      return this._createCertificate(null, CAName, {isCa: true});
    }
  },

  createCertificate: function (domain, CAName, oldCertInfo) {
    var caCert = this.getCACertificate(CAName);
    var cert = this._createCertificate(caCert, domain, null, oldCertInfo);

    return cert;
  },

  _createCertificate: function (caCert, domain, options, oldCertInfo) {
    // Generating 1024-bit key-pair...'
    var keys = pki.rsa.generateKeyPair(1024);
    // Creating self-signed certificate...
    var cert = pki.createCertificate();
    // unique id
    var uid = md5.create().update(domain).digest().toHex();

    options = options || {};

    var days = options.days || 365;
    var isCa = options.isCa || false;

    var attributes = options.attributes || [
      {name: 'commonName', value: domain}
    ].concat(defaultFields.attributes);

    var extensions = options.extensions || [
      {name: 'basicConstraints', cA: isCa}
    ].concat(defaultFields.attributes);

    if (!isCa) {
      extensions.push({
        name: 'subjectAltName',
        altNames: [
          {
            type: 6, // URI
            value: 'https://github.com/hiproxy'
          },
          // {
          //   type: 7, // IP
          //   ip: '127.0.0.1'
          // },
          {
            type: 2,
            value: domain
          }
        ]
      });
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
    var pem = {
      privateKey: forge.pki.privateKeyToPem(keys.privateKey),
      publicKey: forge.pki.publicKeyToPem(keys.publicKey),
      certificate: forge.pki.certificateToPem(cert)
    };

    var certDir = path.join(homedir(), '.hiproxy', 'cert');
    mkdirp(certDir);
    var fileName = domain.replace(/\s+/g, '_');
    writeFile(fileName + '.key', certDir, pem.privateKey);
    writeFile(fileName + '.pem', certDir, pem.certificate);

    return pem;
  }
};

function writeFile (fileName, basedir, content) {
  fs.writeFile(path.join(basedir, fileName), content, function (err) {
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

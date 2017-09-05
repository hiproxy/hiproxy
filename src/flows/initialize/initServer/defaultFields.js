/**
 * @file Default certificate fields.
 * @author zdying
 */

'use strict';

module.exports = {
  attributes: [
    // {
    //   name: 'commonName',
    //   value: 'Hiproxy Custom CA'
    // },
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
  ],

  extensions: [
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    }, {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      emailProtection: true,
      timeStamping: true
    }, {
      name: 'nsCertType',
      client: true,
      server: true,
      email: true,
      objsign: true,
      sslCA: true,
      emailCA: true,
      objCA: true
    }, {
      name: 'subjectAltName',
      altNames: [{
        type: 6, // URI
        value: 'https://github.com/hiproxy'
      }
      /*
      ,{
        type: 7, // IP
        ip: '127.0.0.1'
      }
      */]
    }, {
      name: 'subjectKeyIdentifier'
    }
  ]
};

/**
 * @file Manage hiproxy cache dir info
 * @author zdying
 */
'use strict';

var fs = require('fs');
var os = require('os');
var path = require('path');
var osHomedir = require('os-homedir');

var isNPMTest = process.env.NPM_TEST;
var tmpdir = os.tmpdir();
var homedir = osHomedir();
var hiporxyDir = path.join(isNPMTest ? tmpdir : homedir, '.hiproxy');

module.exports = {
  getHomeDir: function () {
    return homedir;
  },

  getTmpDir: function () {
    return tmpdir;
  },

  getHiproxyDir: function () {
    return hiporxyDir;
  },

  getCertificateDir: function () {
    return path.join(hiporxyDir, 'cert');
  },

  clearCacheDir: function (type) {
    var dir = '';
    switch (type) {
      case 'home':
        dir = hiporxyDir;
        break;

      case 'cert':
        dir = this.getCertificateDir();
        break;
    }

    if (!dir) {
      return Promise.reject(Error('Invalid `type` param, type should be one of home`/`cert`'));
    }
    return new Promise(function (resolve, reject) {
      fs.rmdir(dir, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
};

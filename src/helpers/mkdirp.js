/**
 * @file mkdirp
 * @author zdying
 */
'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function mkdirp (dir) {
  /* istanbul ignore next */
  if (fs.existsSync(dir)) {
    return;
  }

  try {
    fs.mkdirSync(dir);
  } catch (err) {
    if (err.code === 'ENOENT') {
      mkdirp(path.dirname(dir));
      mkdirp(dir);
    }
  }
};

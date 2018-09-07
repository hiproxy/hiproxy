/**
 * @file
 * @author zdying
 */
'use strict';

module.exports = function setHeader (response, name, value) {
  var keyLower = name.toLowerCase();
  var header = response.getHeader(name);

  if (keyLower === 'set-cookie') {
    if (header) {
      value = [].concat(header).concat(value);
    } else {
      value = [value];
    }
  }

  response.setHeader(name, value);
};

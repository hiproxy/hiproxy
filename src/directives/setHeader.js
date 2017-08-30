/**
 * @file
 * @author zdying
 */
'use strict';

module.exports = function setHeader (response, name, value) {
  var header = response.getHeader(name);

  if (!Array.isArray(header)) {
    header = header ? [header] : [];
  }

  header.push(value);

  response.setHeader(name, header);
};

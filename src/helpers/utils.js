/**
 * @file common utils
 * @author zdying
 */

'use strict';

exports.clone = clone;
exports.type = type;

function clone (obj) {
  if (obj == null || typeof obj !== 'object') {
    return obj;
  }

  var temp = new obj.constructor();

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      temp[key] = clone(obj[key]);
    }
  }

  return temp;
}

function type (obj) {
  return ({}).toString.call(obj)
    .replace(/\[object (\w+)\]/, '$1')
    .toLowerCase();
}

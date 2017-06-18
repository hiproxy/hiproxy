/**
 * @file common utils
 * @author zdying
 */

'use strict';

exports.clone = clone;
exports.type = type;

function clone (obj, blackList) {
  if (obj == null || typeof obj !== 'object') {
    return obj;
  }

  var temp = new obj.constructor();

  blackList = !Array.isArray(blackList) ? [] : blackList;

  for (var key in obj) {
    if (blackList.indexOf(key) === -1 && obj.hasOwnProperty(key)) {
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

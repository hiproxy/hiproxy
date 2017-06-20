/**
 * @file common utils
 * @author zdying
 */

'use strict';

module.exports = {
  clone: clone,
  type: type,
  parseCookie: parseCookie
};

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

/**
 * 解析cookie。转化成对象，支持数组，不支持对象
 * @param url
 * @returns {*}
 */
function parseCookie (cookie) {
  if (!cookie) {
    return {};
  }

  let res = {};
  let arr = cookie.split(/\s*;\s*/);

  arr.forEach((field) => {
    let kv = field.split('=');
    let key = kv[0];
    let value = kv.slice(1).join('=');

    if (key) {
      if (key in res) {
        res[key] = [].concat(res[key], value);
      } else {
        res[key] = value;
      }
    }
  });

  return res;
}

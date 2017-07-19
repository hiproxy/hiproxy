/**
 * @file common utils
 * @author zdying
 */

'use strict';

module.exports = {
  clone: clone,
  type: type,
  parseCookie: parseCookie,
  parseQueryString: parseQueryString
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

  var res = {};
  var arr = cookie.split(/\s*;\s*/);

  arr.forEach(function (field) {
    var kv = field.split('=');
    var key = kv[0];
    var value = kv.slice(1).join('=');

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

/**
 * 从URL中获取参数，转化成对象，支持数据，不支持对象
 * @param url
 * @returns {*}
 */
function parseQueryString (url) {
  if (!url) {
    return null;
  }

  var res = {};
  var arr = url.split('?');
  var params = arr.slice(1).join('?');
  var fields = params.split('&');

  fields.forEach(function (field) {
    var kv = field.split('=');
    var key = kv[0];
    var value = kv.slice(1).join('=');

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

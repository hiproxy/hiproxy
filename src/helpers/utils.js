/**
 * @file common utils
 * @author zdying
 */

'use strict';

module.exports = {
  clone: clone,
  type: type,
  parseCookie: parseCookie,
  parseQueryString: parseQueryString,
  toJSON: toJSON,
  randomId: randomId
};

function clone (obj, blackList) {
  if (obj == null || typeof obj !== 'object') {
    return obj;
  }

  var _type = type(obj);

  if (_type === 'regexp') {
    return new RegExp(obj.source);
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

function toJSON (object, spaces) {
  return JSON.stringify(object, function (key, value) {
    if (Object.prototype.toString.call(value) === '[object RegExp]') {
      return value.toString();
    } else {
      return value;
    }
  }, spaces);
}

function randomId () {
  var random = Math.random().toString(36).slice(2);
  var time = Date.now().toString(36);

  return (random + time).toUpperCase().replace(/(.{4})(?=[\w\d]+)/g, '$1-');
}

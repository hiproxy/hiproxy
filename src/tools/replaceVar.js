/**
 * @file
 * @author zdying
 */
'use strict';

var type = require('../helpers/type');

/**
 * 替换字符串/对象/数组中的变量
 * 如果传入的是字符串数组，数组中个每个元素，如果是字符串，都会替换
 * 如果是对象，会将所有key对应的value中的变量替换
 *
 * @param {String|Array|Object} str
 * @param {Object} source
 * @returns {*}
 */
module.exports = function replaceVar (str, source) {
  var strType = type(str);
  var allProps = {};
  var currObj = source;
  var props = null;

  var replace = function (str) {
    if (type(str) !== 'string') {
      return str;
    }

    return str.replace(/\$[\w\d_]+/g, function (match) {
      var val = allProps[match];

      if (typeof val === 'string') {
                // 替换首位的引号
        return val.replace(/^(['"])(.*)(\1)$/, '$2');
      } else {
        return match;
      }
    });
  };

  if (strType === 'null' || strType === 'undefined') {
    return str;
  }

    /*
     * 遍历source源对象的所有属性，以及所有上层对象的属性
     * 上层对象的同名属性不会覆盖下级的同名属性
     * 将所有属性合并到一个对象（allProps）中
     */
  while (currObj) {
    props = currObj.props;

    if (type(props) === 'object') {
      for (var key in props) {
        if (!(key in allProps)) {
          allProps[key] = props[key];
        }
      }
    }

    currObj = currObj.parent;
  }

  if (strType === 'string') {
    str = replace(str);
  } else if (strType === 'array') {
    str = str.map(function (string) {
      return replace(string);
    });
  } else if (strType === 'object') {
    for (var key in str) {
      str[key] = replace(str[key]);
    }
  }

  return str;
};

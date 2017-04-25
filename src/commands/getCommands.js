/**
 * @file
 * @author zdying
 */

'use strict';

var types = require('./scope');

/**
 * 获取rewrite rule对象对应的指令以及祖先元素的指令，并根据type过滤
 * @param {Object} rewriteRule 源对象
 * @param {String} [type] 过滤的类型
 * @returns {Array}
 */
module.exports = function getCommonds (rewriteRule, type) {
  var tmp = [];
  var curr = rewriteRule;
  var currCMDs = [];
  var typedCmds = type && types[type];

  while (curr) {
    currCMDs = curr.commands || [];

    if (currCMDs.length && typedCmds && typedCmds.length) {
      currCMDs = currCMDs.filter(function (cmdObj) {
        return typedCmds.indexOf(cmdObj.name) !== -1;
      });
    }

    tmp = tmp.concat(currCMDs);
    curr = curr.parent;
  }

  return tmp;
};

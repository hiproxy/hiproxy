/**
 * @file
 * @author zdying
 */

'use strict';

var types = require('./scope');

/**
 * 获取rewrite rule对象对应的指令以及祖先元素的指令，并根据type过滤
 * @param {Object} rewriteRule 源对象
 * @param {String} [scope] 作用域，过滤的类型
 * @returns {Array}
 */
module.exports = function getCommonds (rewriteRule, scope) {
  var allDirectives = rewriteRule.directives || [];
  var directives = [];
  var typedCmds = scope && types[scope];

  if (allDirectives.length && typedCmds && typedCmds.length) {
    directives = allDirectives.filter(function (cmdObj) {
      return typedCmds.indexOf(cmdObj.directive) !== -1;
    });
  }

  return directives;
};

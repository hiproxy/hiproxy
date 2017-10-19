/**
 * @file rewrite指令
 * @author zdying
 */

var directives = require('./directives');
var scopes = require('./scopes');

var directiveTool = {
  directives: directives,

  scopes: scopes,

  /**
   * 添加指令
   */
  addDirective: function (directive) {
    var scopeArr = directive.scope;
    var name = directive.name;
    var fn = directive.fn;

    if (typeof directives[name] !== 'function') {
      // TODO 检查fn是否是function
      directives[name] = fn;
      scopeArr.forEach(function (_scope) {
        if (Array.isArray(scopes[_scope])) {
          scopes[_scope].push(name);
        } else {
          log.error('Scope', _scope.bold.green, 'does not exists.');
        }
      }, directiveTool);
    } else {
      log.error('Directive', name.bold.green, 'already exists.');
    }
  },

  /**
   * 获取rewrite rule对象对应的指令以及祖先元素的指令，并根据type过滤
   * @param {Object} rewriteRule 源对象
   * @param {String} [scope] 作用域，过滤的类型
   * @returns {Array}
   */
  getDirectives: function (rewriteRule, scope) {
    var allDirectives = rewriteRule.directives || [];
    var directives = [];
    var typedCmds = scope && scopes[scope];

    if (allDirectives.length && typedCmds && typedCmds.length) {
      directives = allDirectives.filter(function (cmdObj) {
        return typedCmds.indexOf(cmdObj.directive) !== -1;
      });
    }

    return directives;
  },

  /**
   * 执行对应作用域中的指令
   * @param {Object} rewriteRule 源对象
   * @param {Object} context 执行指令呢时的this值
   * @param {String} scope 作用域
   */
  execDirectives: function (rewriteRule, context, scope) {
    if (!rewriteRule || !context || !scope) {
      return Promise.resolve([]);
    }

    // call response commands
    var directivesNeedToExec = directiveTool.getDirectives(rewriteRule, scope);

    /* istanbul ignore else */
    if (Array.isArray(directivesNeedToExec)) {
      log.detail('commands that will be executed [' + scope + ']:', JSON.stringify(directivesNeedToExec).bold);

      var results = directivesNeedToExec.map(function (directive) {
        var name = directive.directive;
        var params = directive.arguments || [];
        var func = directives[name];
        var isFunction = typeof func === 'function';

        /* istanbul ignore else */
        if (isFunction) {
          log.debug('exec rewrite ' + scope + ' command', name.bold.green, 'with params', ('[' + params.join(',') + ']').bold.green);
          return func.apply(context, params);
        } else {
          log.debug(name.bold.yellow, 'is not in the scope', scope.bold.green, 'or not exists.');
          return null;
        }
      });

      return Promise.all(results);
    } else {
      log.debug('no commands will be executed, scope:', scope);
      return Promise.resolve([]);
    }
  }
};

module.exports = directiveTool;

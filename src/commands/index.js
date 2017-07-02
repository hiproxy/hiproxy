/**
 * @file rewrite指令
 * @author zdying
 */

var directives = require('./directives');
var scope = require('./scope');

module.exports = {
  directives: directives,

  scope: scope,

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
        if (Array.isArray(scope[_scope])) {
          scope[_scope].push(name);
        } else {
          log.error('Scope', _scope.bold.green, 'does not exists.');
        }
      }, this);
    } else {
      log.error('Directive', name.bold.green, 'already exists.');
    }
  }
};

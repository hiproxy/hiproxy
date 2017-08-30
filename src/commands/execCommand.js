/**
 * @file 执行rewrite rule中相应作用域中的commands
 * @author zdying
 */

'use strict';

var getCommands = require('../commands/getCommands');
var commands = require('../commands/index').directives;

module.exports = function (rewriteRule, context, scope) {
  if (!rewriteRule || !context || !scope) {
    return;
  }

  // call response commands
  var directivesNeedToExec = getCommands(rewriteRule, scope);

  /* istanbul ignore else */
  if (Array.isArray(directivesNeedToExec)) {
    log.detail('commands that will be executed [' + scope + ']:', JSON.stringify(directivesNeedToExec).bold);

    directivesNeedToExec.forEach(function (directive) {
      var name = directive.directive;
      var params = directive.arguments || [];
      var func = commands[name];
      var isFunction = typeof func === 'function';

      /* istanbul ignore else */
      if (isFunction) {
        log.debug('exec rewrite ' + scope + ' command', name.bold.green, 'with params', ('[' + params.join(',') + ']').bold.green);
        func.apply(context, params);
      } else {
        log.debug(name.bold.yellow, 'is not in the scope', scope.bold.green, 'or not exists.');
      }
    });
  } else {
    log.debug('no commands will be executed, scope:', scope);
  }
};

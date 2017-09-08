/**
 * @file Initialize hiproxy env
 * @author zdying
 */

'use strict';

module.exports = function createServer (ctx, next) {
  ctx.log = global.log = this.logger;

  next();
};

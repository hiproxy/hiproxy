/**
 * @file Initialize hiproxy env
 * @author zdying
 */

'use strict';

// var Hosts = require('../../../hosts');
// var Rewrite = require('../../../Rewrite');

module.exports = function createServer (ctx, next) {
  ctx.log = global.log = this.logger;

  next();
};

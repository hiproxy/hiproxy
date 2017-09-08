/**
 * @file Pring Access/Proxy log
 * @author zdying
 */
'use strict';

module.exports = function (ctx, next) {
  // log.access(ctx.req);
  next();
};

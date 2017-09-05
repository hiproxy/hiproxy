/**
 * @file Pring Access/Proxy log
 * @author zdying
 */
'use strict';

module.exports = function (ctx, next) {
  // log.access(ctx.req);
  // console.log('[access]', ctx.req.method, ctx.req.url);
  next();
};

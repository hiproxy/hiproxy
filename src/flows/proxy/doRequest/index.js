/**
 * @file
 * @author zdying
 */
'use strict';

var request = require('./request');
var alias = require('./alias');

module.exports = function (ctx, next) {
  var proxyInfo = ctx.proxyInfo;
  var req = ctx.req;
  var res = ctx.res;
  var isAlias = req.alias;
  var handler = isAlias ? alias : request;

  handler.response.call(this, proxyInfo.rewriteRule, req, res);

  next();
};

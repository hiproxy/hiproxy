/**
 * @file
 * @author zdying
 */
'use strict';

var request = require('./request');
var alias = require('./alias');

module.exports = function (ctx, next) {
  var proxyInfo = ctx.proxy;
  var req = ctx.req;
  var res = ctx.res;
  var isAlias = proxyInfo.alias;
  var handler = isAlias ? alias : request;
  var hiproxy = this;

  handler.response.call(hiproxy, ctx, req, res, next);
};

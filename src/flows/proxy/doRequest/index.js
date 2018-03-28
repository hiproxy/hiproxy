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
  var options = hiproxy.options;
  var cbks = options.onBeforeRequest;

  cbks.forEach(function (cbk) {
    if (typeof cbk === 'function') {
      cbk.call(hiproxy, {
        req: req,
        res: res,
        proxy: proxyInfo,
        rewriteRule: proxyInfo.rewriteRule
      });
    }
  });

  handler.response.call(hiproxy, ctx, req, res, next);
};

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
  var onBeforeRequest = options.onBeforeRequest;

  if (typeof onBeforeRequest === 'function') {
    // TODO 确定这个回掉函数的参数
    onBeforeRequest({
      req: req,
      res: res,
      // body: req.body,
      proxy: proxyInfo,
      rewriteRule: proxyInfo.rewriteRule
    });
  }

  handler.response.call(hiproxy, ctx, req, res, next);
};

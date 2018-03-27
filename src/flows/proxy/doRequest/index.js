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
    // TODO 各个插件也需要能修改？也就是说`onBeforeRequest`应该是个数组。
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

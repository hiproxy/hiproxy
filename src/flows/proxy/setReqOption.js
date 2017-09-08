/**
 * @file
 * @author zdying
 */
'use strict';

module.exports = function (ctx, next) {
  var proxyInfo = ctx.proxyInfo;
  var req = ctx.req;

  req.res = ctx.res;
  req.proxyOptions = proxyInfo.proxyOptions;
  req.hostsRule = proxyInfo.hostsRule;
  req.rewriteRule = proxyInfo.rewriteRule;
  req.PROXY = proxyInfo.PROXY;
  req.alias = proxyInfo.alias;
  req.newUrl = proxyInfo.newUrl;
  req.proxyPass = proxyInfo.proxyPass;

  next();
};

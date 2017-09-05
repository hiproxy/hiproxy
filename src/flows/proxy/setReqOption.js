/**
 * @file
 * @author zdying
 */
'use strict';

module.exports = function (ctx, next) {
  var proxyInfo = ctx.proxyInfo;
  var req = ctx.req;

  req.res = ctx.res;
  req.proxy_options = proxyInfo.proxy_options;
  req.hosts_rule = proxyInfo.hosts_rule;
  req.rewrite_rule = proxyInfo.rewrite_rule;
  req.PROXY = proxyInfo.PROXY;
  req.alias = proxyInfo.alias;
  req.newUrl = proxyInfo.newUrl;
  req.proxyPass = proxyInfo.proxyPass;

  next();
};

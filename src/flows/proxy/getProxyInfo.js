/**
 * @file Get proxy info
 * @author zdying
 */
'use strict';

var getProxyInfo = require('../../rewrite/getProxyInfo');

module.exports = function (ctx, next) {
  var req = ctx.req;
  var hiproxy = this;
  var hosts = hiproxy.hosts;
  var rewrite = hiproxy.rewrite;
  var rule = getProxyInfo(req, hosts.getHost(), rewrite.getRule());

  ctx.proxyInfo = rule;

  next();
};

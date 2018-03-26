/**
 * @file Get proxy info
 * @author zdying
 */
'use strict';

var getProxyInfo = require('../../rewrite/getProxyInfo');

module.exports = function (ctx, next) {
  var req = ctx.req;
  var res = ctx.res;
  var hiproxy = this;
  var hosts = hiproxy.hosts;
  var rewrite = hiproxy.rewrite;
  var body = [];

  // TODO 这里的事件，考虑挪动到initialize/initEvnet/onRequest.js中
  // TODO 这里的body，到时候需要copy到ctx.proxyInfo中

  /**
   * Emitted whenever the request end.
   * @event ProxyServer#requestend
   * @property {String} body request data
   * @property {http.IncomingMessage} response request object
   * @property {http.ServerResponse} response response object
   */
  hiproxy.emit('requestend', body, req, res);

  ctx.proxy = getProxyInfo(req, hosts.getHost(), rewrite.getRule());

  next();
};

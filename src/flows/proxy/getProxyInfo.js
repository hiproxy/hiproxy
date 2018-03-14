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

  req.on('data', function (chunk) {
    body.push(chunk);
  }).on('end', function () {
    body = Buffer.concat(body).toString();
    req.body = body;
    /**
     * Emitted whenever the request end.
     * @event ProxyServer#requestend
     * @property {String} body request data
     * @property {http.IncomingMessage} response request object
     * @property {http.ServerResponse} response response object
     */
    hiproxy.emit('requestend', body, req, res);

    ctx.proxyInfo = getProxyInfo(req, hosts.getHost(), rewrite.getRule());

    next();
  });
};

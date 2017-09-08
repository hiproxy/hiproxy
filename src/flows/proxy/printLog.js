/**
 * @file Pring Access/Proxy log
 * @author zdying
 */
'use strict';

module.exports = function (ctx, next) {
  var req = ctx.req;
  var proxyOption = req.proxyOptions;
  if (req.PROXY) {
    log.access(req, (proxyOption.protocol || 'http:') + '//' + proxyOption.hostname +
      (proxyOption.port ? ':' + proxyOption.port : '') + proxyOption.path);
  } else {
    log.access(req);
    // log.info('direc -', req.url.bold, Date.now() - start, 'ms')
  }
  next();
};

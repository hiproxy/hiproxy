/**
 * @file Pring Access/Proxy log
 * @author zdying
 */
'use strict';

module.exports = function (ctx, next) {
  var req = ctx.req;
  var proxyOption = req.proxyOptions;

  if (req.PROXY) {
    if (req.alias) {
      log.access(req, req.proxyPass ? '(alias to ' + req.proxyPass + ')' : '(alias directive)');
    } else if (req.proxyPass) {
      log.access(req, (proxyOption.protocol || 'http:') + '//' + proxyOption.hostname +
        (proxyOption.port ? ':' + proxyOption.port : '') + proxyOption.path);
    } else {
      log.access(req, '(local file system or echo)');
    }
  } else {
    log.access(req);
  }
  next();
};

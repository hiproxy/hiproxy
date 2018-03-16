/**
 * @file Pring Access/Proxy log
 * @author zdying
 */
'use strict';

module.exports = function (ctx, next) {
  var req = ctx.req;
  var proxy = ctx.proxy;
  // TODO 使用另一个标示来标志是否经过代理
  if (proxy.PROXY) {
    if (proxy.alias) {
      log.access(req, proxy.proxyPass ? '(alias to ' + proxy.proxyPass + ')' : '(alias directive)');
    } else if (proxy.proxyType === 'rewrite') {
      log.access(req, (proxy.protocol || 'http:') + '//' + proxy.hostname +
        (proxy.port ? ':' + proxy.port : '') + proxy.path);
    } else if (proxy.proxyType === 'hosts') {
      log.access(req, 'hosts: ' + proxy.hostsRule + ' ' + proxy.hostName);
    } else {
      log.access(req, '(local file system or echo)');
    }
  } else {
    log.access(req);
  }
  next();
};

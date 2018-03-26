/**
 * @file Pring Access/Proxy log
 * @author zdying
 */
'use strict';

module.exports = function (ctx, next) {
  var req = ctx.req;
  var proxy = ctx.proxy;
  var target = '';
  // TODO 使用另一个标示来标志是否经过代理
  if (proxy.PROXY) {
    if (proxy.alias) {
      target = proxy.proxyPass ? '(alias to ' + proxy.proxyPass + ')' : '(alias directive)';
    } else if (proxy.proxyType === 'rewrite') {
      target = (proxy.protocol || 'http:') + '//' + proxy.hostname + (proxy.port ? ':' + proxy.port : '') + proxy.path;
    } else if (proxy.proxyType === 'hosts') {
      target = 'hosts: ' + proxy.hostsRule + ' ' + proxy.hostName;
    } else {
      target = '(local file system or echo)';
    }
    log.access(req, proxy, target);
  } else {
    log.access(req, proxy);
  }
  next();
};

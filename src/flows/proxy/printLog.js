/**
 * @file Pring Access/Proxy log
 * @author zdying
 */
'use strict';

module.exports = function (ctx, next) {
  var req = ctx.req;
  var proxy = ctx.proxy;
  var target = '';
  var proxyType = proxy.proxyType;

  switch (proxyType) {
    case 'ALIAS':
      target = proxy.proxyPass ? '(alias to ' + proxy.proxyPass + ')' : '(alias directive)';
      break;

    case 'DIRECTIVE':
      target = '(content by directive)';
      break;

    case 'REWRITE':
      target = (proxy.protocol || 'http:') + '//' + proxy.hostname + (proxy.port ? ':' + proxy.port : '') + proxy.path;
      break;

    case 'HOSTS':
      target = 'hosts: ' + proxy.hostsRule + ' ' + proxy.hostName;
      break;

    case 'DIRECT':
      target = '';
      break;

    default:
      target = '(content by local file system or echo directive)';
  }
  log.access(req, proxy, target);
  next();
};

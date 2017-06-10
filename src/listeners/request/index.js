// var fs = require('fs');
// var url = require('url');
// var path = require('path');
// var homedir = require('os-homedir');

var aliasWorker = require('./alias');
var requestWorker = require('./request');
var hiproxyRouter = require('./hiproxyRouter');
var getProxyInfo = require('../../helpers/getProxyInfo');

module.exports = function requestHandler (request, response) {
  var _url = request.url.split('?')[0];
  // var urlObj = url.parse(request.url);
  // var pathName = urlObj.pathname;
  // var query = urlObj.query;
  // var hostname = urlObj.hostname;
  // var port = urlObj.port;
  var start = Date.now();
  var hiproxyPageRoutes = [
    '/',
    '/proxy.pac',
    '/favicon.ico'
  ];
  var hiproxyAPIRoutes = [
    '/api'
  ];

  /**
   * Emitted each time there is a request.
   * @event ProxyServer#request
   * @property {http.IncomingMessage} request request object
   * @property {http.ServerResponse} response response object
   */
  this.emit('request', request, response);

  // hiproxy system page
  if (hiproxyPageRoutes.indexOf(_url) !== -1) {
    hiproxyRouter.render.call(this, _url, request, response);
    return;
  }

  if (hiproxyAPIRoutes.indexOf(_url) !== -1) {
    hiproxyRouter.api.call(this, _url, request, response);
    return;
  }

  request._startTime = start;

  setRequest.call(this, request);

  var rewriteRule = request.rewrite_rule;

  log.detail('proxy request options:', request.url, '==>', JSON.stringify(request.proxy_options));

  // 重定向到本地文件系统
  if (request.alias) {
    return aliasWorker.response.call(this, rewriteRule, request, response);
  }

  return requestWorker.response.call(this, rewriteRule, request, response);
};

function setRequest (request) {
  var proxyInfo = getProxyInfo.call(
    this,
    request,
    this.hosts.getHost(),
    this.rewrite.getRule()
  );

  /**
   * Emitted each time the hiproxy server get proxy info for current request.
   * @event ProxyServer#getProxyInfo
   * @property {Object} proxyInfo proxy info object
   */
  this.emit('getProxyInfo', proxyInfo);

  request.proxy_options = proxyInfo.proxy_options;
  request.hosts_rule = proxyInfo.hosts_rule;
  request.rewrite_rule = proxyInfo.rewrite_rule;
  request.PROXY = proxyInfo.PROXY;
  request.alias = proxyInfo.alias;
  request.newUrl = proxyInfo.newUrl;

  /**
   * Emitted each time the hiproxy server set request options (eg: headers and host) before request data from remote server
   * @event ProxyServer#setRequest
   * @property {http.IncomingMessage} request request
   * @property {Object} proxyOptions the proxy header options
   */
  this.emit('setRequest', request, request.proxy_options);

  return request;
}

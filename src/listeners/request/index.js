var fs = require('fs');
var url = require('url');
var path = require('path');
var homedir = require('os-homedir');

var aliasWorker = require('./alias');
var requestWorker = require('./request');
var getProxyInfo = require('../../helpers/getProxyInfo');

module.exports = function requestHandler (request, response) {
  var _url = request.url.split('?')[0];
  var urlObj = url.parse(request.url);
  // var pathName = urlObj.pathname;
  var query = urlObj.query;
  // var hostname = urlObj.hostname;
  // var port = urlObj.port;
  var start = Date.now();

  /**
   * Emitted each time there is a request.
   * @event ProxyServer#request
   * @property {http.IncomingMessage} request request object
   * @property {http.ServerResponse} response response object
   */
  this.emit('request', request, response);

  if (_url === '/') {
    var pacURL = 'http://127.0.0.1:' + this.httpPort + '/proxy.pac';
    var localIP = this.localIP;
    var httpPort = this.httpPort;
    var httpsPort = this.httpsPort;
    var message = [
      '<pre>',
      ' _     <span class="red">_</span>  ',
      '| |   <span class="red">(_)</span> ',
      '| |__  _    <span class="label">Proxy address:</span> ' + localIP + ':' + httpPort,
      '| \'_ \\| |   <span class="label">Https address:</span> ' + (httpsPort ? localIP + ':' + httpsPort : 'disabled'),
      '| | | | |   <span class="label">Proxy file at:</span> <a href="' + pacURL + '?type=view">' + pacURL + '</a>',
      '|_| |_|_| ',
      '</pre>'
    ];

    response.writeHead(200, {
      'Content-Type': 'text/html'
    });
    response.write('<style>.red{color: #DC544B} .label{color: #10a3ca; font-weight: bold}</style>');
    // response.write('<h1>hiproxy server</h1>');
    response.write(message.join('\n'));
    response.end();
    return;
  }

  if (_url === '/proxy.pac') {
    var pacFilePath = path.resolve(homedir(), '.hiproxy', 'proxy.pac');

    fs.readFile(pacFilePath, 'utf-8', function (err, str) {
      if (err) {
        log.error('read pac file error:', err);
        response.end(err.message);
      } else {
        var contentType = query && query.indexOf('type=view') !== -1 ? 'text/plain' : 'application/x-ns-proxy-autoconfig';
        response.writeHead(200, {
          'Content-Type': contentType
        });
        response.end(str);
      }
    });
    return;
  }

  if (_url === '/favicon.ico') {
    response.end('');
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

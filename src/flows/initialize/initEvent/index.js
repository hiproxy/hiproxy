/**
 * @file Initialize hiproxy server events
 * @author zdying
 */

var onRequest = require('./onRequest');
var onConnect = require('./onConnect');

module.exports = function initEvent (ctx, next) {
  var httpServer = this.httpServer;
  var httpsServer = this.httpsServer;

  httpServer
    .on('request', onRequest.bind(this))
    .on('connect', onConnect.bind(this));

  // https中间人代理服务器事件绑定
  // 中间人代理服务收到请求时：
  //  1. 如果是`127.0.0.1`的请求，返回代理服务器的相关页面
  //  2. 如果是其他的请求，去请求资源
  httpsServer && httpsServer
    .on('request', function (req, res) {
      var url = req.url;
      var host = req.headers.host;
      var protocol = req.client.encrypted ? 'https' : 'http';

      this.logger.debug('http middle man _server receive request ==>', protocol, host, url);

      /**
       * Emitted each time there is a request to the https server.
       * @event ProxyServer#httpsRequest
       * @property {http.IncomingMessage} request request object
       * @property {http.ServerResponse} response response object
       */
      this.emit('httpsRequest', req, res);
      // this.emit('request', req, res);

      if (!url.match(/^\w+:\/\//)) {
        req.url = protocol + '://' + host + url;
      }

      if (host === '127.0.0.1:' + this.httpsPort) {
        res.end('the man in the middle page: ' + url);
      } else {
        onRequest.call(this, req, res);
      }
    }.bind(this));

  next();
};

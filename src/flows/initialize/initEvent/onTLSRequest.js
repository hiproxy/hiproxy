/**
 * @file HTTPS server REQUEST handler
 * @author zdying
 */
'use strict';

var onRequest = require('./onRequest');
var utils = require('../../../helpers/utils');

// 中间人代理服务收到请求时：
//  1. 如果是`127.0.0.1`的请求，返回代理服务器的相关页面
//  2. 如果是其他的请求，去请求资源
module.exports = function (req, res) {
  var url = req.url;
  var host = req.headers.host;
  var protocol = req.client.encrypted ? 'https' : 'http';

  req.requestId = utils.randomId();

  this.logger.debug('HTTPS server request:', protocol, host, url);

  /**
   * Emitted each time there is a request to the https server.
   * @event ProxyServer#httpsRequest
   * @property {http.IncomingMessage} request request object
   * @property {http.ServerResponse} response response object
   */
  this.emit('httpsRequest', {
    req: req,
    res: res
  });
  // this.emit('request', req, res);

  if (!url.match(/^\w+:\/\//)) {
    req.url = protocol + '://' + host + url;
  }

  if (host === '127.0.0.1:' + this.httpsPort || host === 'localhost:' + this.httpsPort) {
    res.end('the man in the middle page: ' + url);
  } else {
    onRequest.call(this, req, res);
  }
};

/**
 * @file Initialize hiproxy server events
 * @author zdying
 */

var onRequest = require('./onRequest');
var onConnect = require('./onConnect');
var onTLSRequest = require('./onTLSRequest');

module.exports = function initEvent (ctx, next) {
  var httpServer = this.httpServer;
  var httpsServer = this.httpsServer;

  // http服务器事件绑定
  httpServer
    .on('request', onRequest.bind(this))
    .on('connect', onConnect.bind(this));

  // https中间人代理服务器事件绑定
  httpsServer && httpsServer.on('request', onTLSRequest.bind(this));

  next();
};

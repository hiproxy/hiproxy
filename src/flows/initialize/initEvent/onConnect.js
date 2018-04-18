/**
 * @file HTTP server CONNECT handler
 * @author zdying
 */

'use strict';

var url = require('url');
var net = require('net');
var utils = require('../../../helpers/utils');

/**
 * 处理`CONNECT`请求
 */
module.exports = function connectHandler (request, socket, head) {
  var urlObj = url.parse('https://' + request.url);
  var hostname = urlObj.hostname;
  var port = Number(urlObj.port) || 443;
  var rewriteRule = this.rewrite.getRule(hostname);
  var hostRule = this.hosts.getHost(hostname);
  var middleManPort = this.httpsPort;

  request.requestId = utils.randomId();
  request._startTime = Date.now();

  /**
   * Emitted each time the server responds to a request with a `CONNECT` method.
   * @event ProxyServer#connect
   * @property {http.IncomingMessage} request request object
   * @property {net.Socket} socket socket object
   * @property {Buffer} head  head
   */
  this.emit('connect', request, socket, head);

  if (rewriteRule || hostRule) {
    hostname = '127.0.0.1';
    port = middleManPort;
    log.info('https proxy -', request.url.bold.green, '==>', hostname.bold.green, 'rule type:', (rewriteRule ? 'rewrite' : 'hosts').bold.green);
  } else {
    log.info('https direc -', request.url.bold);
    log.access(request);
  }

  log.debug('connect to:', port, hostname);
  // if (!this.httpsPort || !this.httpsServer) {
  //   socket.write('HTTP/1.1 200 Error\r\n\r\nThe HTTPS server has not been started.');
  //   socket.end();
  //   return;
  // }

  var proxySocket = net.connect(port, hostname, function () {
    socket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    proxySocket.write(head);
    proxySocket.pipe(socket);
  }).on('error', function (e) {
    log.error('proxy error', e.message);
    log.detail('proxy error', e.stack);
    socket.end();
  }).on('data', function (data) {
    // console.log('proxy socker data:', data.toString());
    // socket.write(data);
  });

  socket.pipe(proxySocket);
};

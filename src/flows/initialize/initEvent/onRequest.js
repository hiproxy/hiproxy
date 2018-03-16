/**
 * @file HTTP server REQUEST handler
 * @author zdying
 */
'use strict';

var proxyFlow = require('../../proxy');
var utils = require('../../../helpers/utils');

module.exports = function (req, res) {
  var hiproxy = this;

  req.requestId = utils.randomId();

  /* Emitted each time there is a request.
   * @event ProxyServer#request
   * @property {http.IncomingMessage} request request object
   * @property {http.ServerResponse} response response object
   */
  this.emit('request', req, res);

  req._startTime = Date.now();

  // var oldWrite = res.write;
  var oldEnd = res.end;
  var isString = false;
  var body = [];
  var collectChunk = function (chunk) {
    if (!chunk) {
      return;
    }

    if (typeof chunk === 'string') {
      isString = true;
    }

    body.push(chunk);
  };

  res.write = function (chunk, encoding) {
    collectChunk(chunk);
    /**
     * Emitted whenever the response stream received some chunk of data.
     * @event ProxyServer#data
     * @property {Buffer} data response data
     * @property {http.IncomingMessage} request request object
     * @property {http.ServerResponse} response response object
     */
    hiproxy.emit('data', chunk, req, res, encoding);
  };

  res.end = function (chunk, encoding) {
    collectChunk(chunk);
    body = isString ? body.join('') : Buffer.concat(body);

    req.res = res;

    /**
     * Emitted when a response is end. This event is emitted only once.
     * @event ProxyServer#response
     * @property {http.IncomingMessage} request request object
     * @property {http.ServerResponse} response response object
     */
    hiproxy.emit('response', req, res, encoding);

    oldEnd.call(res, body);
  };

  proxyFlow.run({
    req: req,
    res: res,
    // hiproxy: hiproxy,
    logger: this.logger
  }, null, this);
};

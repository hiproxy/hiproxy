/**
 * @file HTTP server REQUEST handler
 * @author zdying
 */
'use strict';

var proxyFlow = require('../../proxy');
var utils = require('../../../helpers/utils');

module.exports = function (req, res) {
  req.requestId = utils.randomId();

  /* Emitted each time there is a request.
   * @event ProxyServer#request
   * @property {http.IncomingMessage} request request object
   * @property {http.ServerResponse} response response object
   */
  this.emit('request', req, res);

  req._startTime = Date.now();

  // var oldWrite = res.write;

  // res.write = function () {
  //   console.log('res.write', arguments);
  //   oldWrite.apply(res, arguments);
  // };

  proxyFlow.run({
    req: req,
    res: res,
    // hiproxy: hiproxy,
    logger: this.logger
  }, null, this);
};

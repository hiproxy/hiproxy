/**
 * @file HTTP server REQUEST handler
 * @author zdying
 */
'use strict';

var proxyFlow = require('../../proxy');
var utils = require('../../../helpers/utils');

module.exports = function (req, res) {
  var ctx = {
    req: req,
    res: res,
    proxy: null
  };

  req.requestId = utils.randomId();
  req._startTime = Date.now();
  req.res = res;
  res.headers = res.headers || {};

  /* Emitted each time there is a request.
   * @event ProxyServer#request
   * @property {http.IncomingMessage} request request object
   * @property {http.ServerResponse} response response object
   */
  this.emit('request', req, res);

  proxyFlow.run(ctx, null, this);
};

/**
 * @file Initialize hiproxy server
 * @author zdying
 */

'use strict';

var serverTool = require('./serverTool');

module.exports = function createServer (ctx, next) {
  var hiproxy = this;
  var port = this.httpPort;
  var httpsPort = this.httpsPort;

  var promises = [serverTool.create(port)];

  if (this.httpsPort) {
    promises.push(serverTool.create(httpsPort, true, this.rewrite));
  }

  Promise.all(promises).then(function (servers) {
    hiproxy.httpServer = servers[0];
    hiproxy.httpsServer = servers[1];

    /**
     * Emitted when the hiproxy server(s) start.
     * @event ProxyServer#start
     * @property {Array} servers http/https server
     * @property {String} localIP the local ip address
     */
    hiproxy.emit('start', {
      servers: servers,
      localIP: ctx.localIP
    });

    next();
  }).catch(function (err) {
    console.log('error:', err.stack);
    next(err);
  });
};

/**
 * @file 代理请求转发到本地文件系统
 * @author zdying
 */

'use strict';

var fs = require('fs');
var path = require('path');

var getMimeType = require('simple-mime')('text/plain');
var execResponseCommand = require('../../commands/execCommand');

module.exports = {
  response: function (rewriteRule, request, response) {
    log.info(request.url + ' ==> ' + request.newUrl);

    response.headers = response.headers || {};

    // 执行response作用域的command
    execResponseCommand(rewriteRule, {
      response: response
    }, 'response');

    /**
     * Emitted each time the server set response info (eg: headers).
     * @event ProxyServer#setResponse
     * @property {http.ServerResponse} response request object
     */
    this.emit('setResponse', response);

    try {
      var stats = fs.statSync(request.newUrl);
      var filePath = request.newUrl;
      var rewrite = request.rewrite_rule;

      if (stats.isDirectory()) {
        log.debug('isDirectory and add root:' + (rewrite.variables.default || 'index.html'));
        filePath = path.join(filePath, rewrite.variables.default || 'index.html');
      }

      // TODO 如果没有root，列出目录
      var stream = fs.createReadStream(filePath);
      response.setHeader('Content-Type', getMimeType(filePath));

      stream.on('error', function (e) {
        response.statusCode = 404;
        response.end('404 Not Found: <br><pre>' + e.stack + '</pre>');
      });

      return stream.pipe(response);
    } catch (err) {
      log.error(err);
      response.setHeader('Content-Type', 'text/html');

      if (err.code === 'ENOENT') {
        response.statusCode = 404;
        response.end('404 Not Found: <br><pre>' + err.stack + '</pre>');
      } else {
        response.statusCode = 500;
        response.end('500 Server Internal Error: <br><pre>' + err.stack + '</pre>');
      }
    }
  }
};

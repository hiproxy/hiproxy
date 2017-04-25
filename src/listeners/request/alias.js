/**
 * @file 代理请求转发到本地文件系统
 * @author zdying
 */

'use strict';

var fs = require('fs');

var getMimeType = require('simple-mime')('text/plain');
var execResponseCommand = require('../../tools/execCommand');

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
        log.debug('isDirectory and add root:' + (rewrite.props.default || 'index.html'));
        filePath += rewrite.props.default || 'index.html';
      }

      // TODO 如果没有root，列出目录
      response.setHeader('Content-Type', getMimeType(filePath));

      // TODO 这里不应该自己调用setHeader，应该继续增强commands中的命令
      for (var key in response.headers) {
        response.setHeader(key, response.headers[key]);
      }

      return fs.createReadStream(filePath).pipe(response);
    } catch (e) {
      response.setHeader('Content-Type', 'text/html');
      if (e.code === 'ENOENT') {
        response.statusCode = 404;
        response.end('404 Not Found: <br><pre>' + e.stack + '</pre>');
      } else {
        response.statusCode = 500;
        response.end('500 Server Internal Error: <br><pre>' + e.stack + '</pre>');
      }
    }
  }
};

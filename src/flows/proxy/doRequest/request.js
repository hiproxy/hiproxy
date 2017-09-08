/**
 * @file 代理请求转发到其他服务器
 * @author zdying
 */

'use strict';

var http = require('http');
var https = require('https');
var zlib = require('zlib');

var execDirectives = require('../../../directives').execDirectives;

module.exports = {
  response: function (rewriteRule, request, response) {
    var proxyOption = request.proxyOptions;
    var isHTTPS = proxyOption.protocol === 'https:';
    var self = this;

    proxyOption.headers['accept-encoding'] = 'gzip,deflate';

    if (isHTTPS) {
      proxyOption.rejectUnauthorized = false;
    }

    if (!request.proxyPass && !proxyOption.hostname) {
      log.debug(request.url, 'has no proxy_pass');
      execDirectives(rewriteRule, {
        response: response,
        rewriteRule: rewriteRule
      }, 'response');
      // TODO 什么时候end()? 这是个问题，有时候我们进行异步操作，这时候，直接执行end()，异步操作的write等将失败。
      if (!response.finished) {
        response.end('');
      }
      return;
    }

    var proxy = (isHTTPS ? https : http).request(proxyOption, function (res) {
      response.headers = res.headers;

      // response.removeHeader('Content-Encoding')
      // delete response.headers['content-encoding']

      execDirectives(rewriteRule, {
        response: response,
        rewriteRule: rewriteRule
      }, 'response');

      /**
       * Emitted each time the server set response info (eg: headers).
       * @event ProxyServer#setResponse
       * @property {http.ServerResponse} response request object
       */
      self.emit('setResponse', response);

      // response.pipe(res)
      response.writeHead(res.statusCode, res.headers);

      /*
      res.pause()

      log.warn('request was paused:'.red, _url.bold.red)

      setTimeout(function(){
          res.resume()
          log.warn('request was resumed:'.red, _url.bold.red)
      }, 5000)
      */

      var contentType = res.headers['content-type'];
      var encoding = response.headers['content-encoding'];
      var canUnZip = encoding === 'gzip' || encoding === 'deflate';
      var isTextFile = /(text|xml|html|plain|json|javascript|css)/.test(contentType);

      if (canUnZip && isTextFile) {
        var unzipStream = encoding === 'gzip' ? zlib.createUnzip() : zlib.createInflate();

        unzipStream.on('data', function (chunk) {
          self.emit('data', chunk);
        });

        /* istanbul ignore next */
        unzipStream.on('error', function (err) {
          log.error('error ==>', err);
        });
      } else {
        res.on('data', function (chunk) {
          /**
           * Emitted whenever the response stream received some chunk of data.
           * @event ProxyServer#data
           * @property {Buffer} data response data
           */
          self.emit('data', chunk);
        });
      }

      res.pipe(response);

      res.on('end', function () {
        request.res = res;

        /**
         * Emitted when a response is end. This event is emitted only once.
         * @event ProxyServer#response
         * @property {http.ServerResponse} response response object
         */
        self.emit('response', response);

        if (request.PROXY) {
          log.access(request, (proxyOption.protocol || 'http:') + '//' + proxyOption.hostname +
            (proxyOption.port ? ':' + proxyOption.port : '') + proxyOption.path);
        } else {
          log.access(request);
        // log.info('direc -', request.url.bold, Date.now() - start, 'ms')
        }
      });
    });

    proxy.on('error', function (e) {
      /* istanbul ignore next */
      if (e.code === 'ENOTFOUND') {
        response.statusCode = 404;
        response.end();
      } else {
        response.statusCode = 500;
        response.end(e.stack);
      }

      log.error('proxy error:', request.url);
      log.detail(e.stack);

      self.emit('response', response);

      request.res = response;
      log.access(request);
    });

    request.pipe(proxy);
  }
};

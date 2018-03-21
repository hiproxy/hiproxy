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
  response: function (ctx, request, response, next) {
    var proxyInfo = ctx.proxy;
    var rewriteRule = proxyInfo.rewriteRule;
    var isHTTPS = proxyInfo.protocol === 'https:';
    var self = this;
    var execResult;

    proxyInfo.headers['accept-encoding'] = 'gzip,deflate';
    proxyInfo.headers['content-length'] = (request.body || '').length;

    if (isHTTPS) {
      proxyInfo.rejectUnauthorized = false;
    }

    if (!proxyInfo.proxyPass && !proxyInfo.hostname) {
      log.debug(request.url, 'has no proxy_pass');
      execResult = execDirectives(rewriteRule, {
        response: response,
        rewriteRule: rewriteRule
      }, 'response');

      execResult.then(function (values) {
        if (!response.finished) {
          response.end('');
        }

        // /**
        //  * Emitted when a response is end. This event is emitted only once.
        //  * @event ProxyServer#response
        //  * @property {http.ServerResponse} response response object
        //  */
        // self.emit('response', request, response);
        next();
      });

      return;
    }

    log.debug('request remote server', JSON.stringify(proxyInfo));

    var proxy = (isHTTPS ? https : http).request(proxyInfo, function (res) {
      log.debug('request remote result', JSON.stringify(res.headers));

      var contentType = res.headers['content-type'];
      var encoding = res.headers['content-encoding'];
      var needUnZip = encoding === 'gzip' || encoding === 'deflate';
      var isTextFile = /(text|xml|html|plain|json|javascript|css)/.test(contentType);

      response.headers = res.headers;
      response.statusCode = res.statusCode;
      response.statusMessage = res.statusMessage;

      if (needUnZip) {
        delete res.headers['content-encoding'];
        delete res.headers['content-length'];
        res.headers['x-hiproxy-origin-content-encoding'] = encoding;
      }

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

      /*
      res.pause()

      log.warn('request was paused:'.red, _url.bold.red)

      setTimeout(function(){
          res.resume()
          log.warn('request was resumed:'.red, _url.bold.red)
      }, 5000)
      */

      if (needUnZip && isTextFile) {
        var unzipStream = encoding === 'gzip' ? zlib.createUnzip() : zlib.createInflate();

        // unzipStream.on('data', function (chunk) {
        //   self.emit('data', chunk, request, response);
        // });

        /* istanbul ignore next */
        unzipStream.on('error', function (err) {
          log.error('error ==>', err);
        });

        res.pipe(unzipStream).pipe(response);
        // .on('end', function () {
          // request.res = res;

          // /**
          //  * Emitted when a response is end. This event is emitted only once.
          //  * @event ProxyServer#response
          //  * @property {http.ServerResponse} response response object
          //  */
          // self.emit('response', request, response);

          // next();
        // });
      } else {
        // res.on('data', function (chunk) {
        //   /**
        //    * Emitted whenever the response stream received some chunk of data.
        //    * @event ProxyServer#data
        //    * @property {Buffer} data response data
        //    */
        //   self.emit('data', chunk, request, response);
        // });

        // res.on('end', function () {
        //   request.res = res;

        //   /**
        //    * Emitted when a response is end. This event is emitted only once.
        //    * @event ProxyServer#response
        //    * @property {http.ServerResponse} response response object
        //    */
        //   self.emit('response', request, response);

        //   next();
        // });

        res.pipe(response);
      }

      res.on('end', function () {
        // request.res = res;

        // /**
        //  * Emitted when a response is end. This event is emitted only once.
        //  * @event ProxyServer#response
        //  * @property {http.ServerResponse} response response object
        //  */
        // self.emit('response', request, response);

        next();
      });

      // res.pipe(response);
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

      // self.emit('response', request, response);

      request.res = response;
      // log.access(request);
      next();
    });

    proxy.end(request.body);
  }
};

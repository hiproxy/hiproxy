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
  response: function (rewriteRule, request, response, next) {
    var proxyOption = request.proxyOptions;
    var isHTTPS = proxyOption.protocol === 'https:';
    var self = this;
    var execResult;

    proxyOption.headers['accept-encoding'] = 'gzip,deflate';
    proxyOption.headers['content-length'] = (request.body || '').length;

    if (isHTTPS) {
      proxyOption.rejectUnauthorized = false;
    }

    if (!request.proxyPass && !proxyOption.hostname) {
      log.debug(request.url, 'has no proxy_pass');
      execResult = execDirectives(rewriteRule, {
        response: response,
        rewriteRule: rewriteRule
      }, 'response');

      execResult.then(function (values) {
        if (!response.finished) {
          response.end('');
        }

        /**
         * Emitted when a response is end. This event is emitted only once.
         * @event ProxyServer#response
         * @property {http.ServerResponse} response response object
         */
        self.emit('response', request, response);
        next();
      });

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
          self.emit('data', chunk, request, response);
        });

        /* istanbul ignore next */
        unzipStream.on('error', function (err) {
          log.error('error ==>', err);
        });

        res.pipe(unzipStream).on('end', function () {
          request.res = res;

          /**
           * Emitted when a response is end. This event is emitted only once.
           * @event ProxyServer#response
           * @property {http.ServerResponse} response response object
           */
          self.emit('response', request, response);

          next();
        });
      } else {
        res.on('data', function (chunk) {
          /**
           * Emitted whenever the response stream received some chunk of data.
           * @event ProxyServer#data
           * @property {Buffer} data response data
           */
          self.emit('data', chunk, request, response);
        });

        res.on('end', function () {
          request.res = res;

          /**
           * Emitted when a response is end. This event is emitted only once.
           * @event ProxyServer#response
           * @property {http.ServerResponse} response response object
           */
          self.emit('response', request, response);

          next();
        });
      }

      res.pipe(response);
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

      self.emit('response', request, response);

      request.res = response;
      // log.access(request);
      next();
    });

    proxy.end(request.body);
  }
};

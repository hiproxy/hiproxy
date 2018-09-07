/**
 * @file 代理请求转发到其他服务器
 * @author zdying
 */

'use strict';

var http = require('http');
var https = require('https');
var zlib = require('zlib');

// var execDirectives = require('../../../directives').execDirectives;

module.exports = {
  response: function (ctx, req, res, next) {
    var proxyInfo = ctx.proxy;
    // var rewriteRule = proxyInfo.rewriteRule;
    var isHTTPS = proxyInfo.protocol === 'https:';
    var self = this;
    // var execResult;

    // proxyInfo.headers['accept-encoding'] = 'gzip,deflate';
    // if ('content-length' in proxyInfo.headers) {
    //   proxyInfo.headers['content-length'] = Buffer.byteLength(request.body || '');
    // }

    // TODO 支持读取配置，决定是否拒绝
    if (isHTTPS) {
      proxyInfo.rejectUnauthorized = false;
    }

    if (!proxyInfo.proxyPass && !proxyInfo.hostname) {
      log.debug(req.url, 'has no proxy_pass');
      // execResult = execDirectives(rewriteRule, {
      //   response: response,
      //   rewriteRule: rewriteRule
      // }, 'response');

      // execResult.then(function (values) {
      //   if (!response.finished) {
      //     response.end('');
      //   }

      //   // /**
      //   //  * Emitted when a response is end. This event is emitted only once.
      //   //  * @event ProxyServer#response
      //   //  * @property {http.ServerResponse} response response object
      //   //  */
      //   // self.emit('response', request, response);
      //   next();
      // });
      // TODO 如果在指令中再次调用了`end()`方法，会导致调用两次end，能否优化？？？
      res.end('');

      next();

      return;
    }

    var requestOptions = getRequestOption(proxyInfo);

    log.debug('request remote server proxy info', JSON.stringify(proxyInfo));
    log.debug('request remote server request option', JSON.stringify(requestOptions));
    log.debug('request original info', JSON.stringify(req.originReq));

    var proxy = (isHTTPS ? https : http).request(requestOptions, function (response) {
      log.debug('request remote result', JSON.stringify(response.headers));

      var contentType = response.headers['content-type'];
      var encoding = response.headers['content-encoding'];
      var needUnZip = encoding === 'gzip' || encoding === 'deflate';
      var isTextFile = /(text|xml|html|plain|json|javascript|css)/.test(contentType);

      var stream = null;
      var originData = [];

      res.headers = response.headers;
      res.statusCode = response.statusCode;
      res.statusMessage = response.statusMessage;

      res.originalInfo = {
        headers: JSON.parse(JSON.stringify(response.headers)),
        statusCode: response.statusCode,
        statusMessage: response.statusMessage
      };

      if (needUnZip) {
        delete response.headers['content-encoding'];
        delete response.headers['content-length'];
        response.headers['x-hiproxy-origin-content-encoding'] = encoding;
      }

      // 这里暂时不执行
      // execDirectives(rewriteRule, {
      //   response: response,
      //   rewriteRule: rewriteRule
      // }, 'response');

      /**
       * Emitted each time the server set response info (eg: headers).
       * @event ProxyServer#setResponse
       * @property {http.ServerResponse} response request object
       */
      self.emit('setResponse', res);

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

        stream = unzipStream;

        /* istanbul ignore next */
        unzipStream.on('error', function (err) {
          log.error('error ==>', err);
        });

        response.pipe(unzipStream).pipe(res);
      } else {
        stream = response;

        response.pipe(res);
      }

      stream.on('data', function (chunk) {
        originData.push(chunk);
      });

      stream.on('end', function () {
        res.originalInfo.body = Buffer.concat(originData);
        next();
      });
    });

    proxy.on('error', function (e) {
      /* istanbul ignore next */
      if (e.code === 'ENOTFOUND') {
        res.statusCode = 404;
      } else {
        res.statusCode = 500;
      }

      res.end(e.stack);

      log.error('proxy error:', req.url);
      log.detail(e.stack);

      // self.emit('response', request, response);

      next();
    });

    proxy.end(req.body);
  }
};

function getRequestOption (proxyInfo) {
  // return the request options
  // see: https://nodejs.org/api/http.html#http_http_request_options_callback
  // and: https://nodejs.org/api/https.html#https_https_request_options_callback
  var httpRequestOptions = [
    'protocol',
    'host',
    'hostname',
    'family',
    'port',
    'localAddress',
    'socketPath',
    'method',
    'path',
    'headers',
    'auth',
    'timeout'
  ];
  var additionalOptions = [
    // 'ca',
    // 'cert',
    // 'ciphers',
    // 'clientCertEngine',
    // 'crl',
    // 'dhparam',
    // 'ecdhCurve',
    // 'honorCipherOrder',
    // 'key',
    // 'passphrase',
    // 'pfx',
    // 'secureOptions',
    // 'secureProtocol',
    // 'servername',
    // 'sessionIdContext',
    'rejectUnauthorized'
  ];
  var options = {};

  httpRequestOptions.concat(additionalOptions).forEach(function (key) {
    if (key in proxyInfo) {
      options[key] = proxyInfo[key];
    }
  });

  return options;
}

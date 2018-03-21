/**
 * @file HTTP server REQUEST handler
 * @author zdying
 */
'use strict';

var url = require('url');
var proxyFlow = require('../../proxy');
var utils = require('../../../helpers/utils');

module.exports = function (req, res) {
  var hiproxy = this;
  var ctx = {
    req: req,
    res: res,
    proxy: null
  };
  var urlInfo = url.parse(req.url);
  var needHook = urlInfo.hostname && urlInfo.hostname !== '127.0.0.1';

  req.requestId = utils.randomId();
  req._startTime = Date.now();
  req.res = res;

  /* Emitted each time there is a request.
   * @event ProxyServer#request
   * @property {http.IncomingMessage} request request object
   * @property {http.ServerResponse} response response object
   */
  this.emit('request', req, res);

  if (needHook) {
    log.debug(req.url, 'need to hook `res.write()` and `res.end()`');
    hookResponse(hiproxy, ctx);
  }

  proxyFlow.run(ctx, null, this);
};

function hookResponse (hiproxy, ctx) {
  var res = ctx.res;
  var req = ctx.req;
  var onData = hiproxy.options.onData;
  var onBeforeResponse = hiproxy.options.onBeforeResponse;

  // 缓存res原始的write和end方法
  var oldWrite = res.write;
  var oldEnd = res.end;
  // 数据是否为string
  var isString = false;
  // 缓存数据
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
    var cbkResult = null;
    if (typeof onData === 'function') {
      cbkResult = onData({
        data: chunk,
        req: req,
        res: res,
        proxy: ctx.proxy,
        encoding: encoding
      });
      // if return null or undefined, will not change the original chunk.
      if (cbkResult && cbkResult.data != null) {
        chunk = cbkResult.data;
      }
    }
    collectChunk(chunk);

    /**
     * Emitted whenever the response stream received some chunk of data.
     * @event ProxyServer#data
     * @property {Object} detail event detail data
     * @property {Buffer|String} detail.data response data
     * @property {http.IncomingMessage} detail.req request object
     * @property {http.ServerResponse} detail.res response object
     * @property {Object|Null} detail.proxy proxy info
     * @property {String|Undefined} detail.encoding data encoding
     */
    hiproxy.emit('data', {
      data: chunk,
      req: req,
      res: res,
      proxy: ctx.proxy,
      encoding: encoding
    });
  };

  res.end = function (chunk, encoding) {
    var cbkResult = null;
    collectChunk(chunk);
    body = isString ? body.join('') : Buffer.concat(body);

    if (typeof onBeforeResponse === 'function') {
      cbkResult = onBeforeResponse({
        data: body,
        req: req,
        res: res,
        proxy: ctx.proxy,
        encoding: encoding
      });
      // if return null or undefined, will not change the original chunk.
      if (cbkResult && cbkResult.data != null) {
        body = cbkResult.data;
      }
    }

    /**
     * Emitted when a response is end. This event is emitted only once.
     * @event ProxyServer#response
     * @property {Object} detail event detail data
     * @property {Buffer|String} detail.data response data
     * @property {http.IncomingMessage} detail.req request object
     * @property {http.ServerResponse} detail.res response object
     * @property {Object|Null} detail.proxy proxy info
     * @property {String|Undefined} detail.encoding data encoding
     */
    hiproxy.emit('response', {
      data: body,
      req: req,
      res: res,
      proxy: ctx.proxy,
      encoding: encoding
    });

    // write headers to the browser
    res.writeHead(res.statusCode, res.statusMessage, res.headers);

    // call `oldEnd()` will call `res.write()` again，so we shold resotre the `write()` method.
    res.write = oldWrite;
    res.end = oldEnd;
    // 最后一次性推送数据到浏览器
    oldEnd.call(res, body);
  };
}

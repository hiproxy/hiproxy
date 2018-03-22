/**
 * @file HTTP server REQUEST handler
 * @author zdying
 */
'use strict';

var url = require('url');
// var Buffer = require('safe-buffer').Buffer;
var proxyFlow = require('../../proxy');
var utils = require('../../../helpers/utils');
var execDirectives = require('../../../directives').execDirectives;

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
  res.headers = res.headers || {};

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
  // 缓存数据
  var cache = [];
  var collectChunk = function (chunk, encoding) {
    if (!chunk) {
      return;
    }

    // 如果是String，转换为Buffer
    if (typeof chunk === 'string') {
      chunk = new Buffer(chunk, encoding);
    }

    cache.push(chunk);
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
    collectChunk(chunk, encoding);

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
    var body = null;
    var context = {
      req: req,
      res: res,
      proxy: ctx.proxy,
      encoding: encoding,
      rewriteRule: ctx.proxy.rewriteRule
    };

    collectChunk(chunk, encoding);

    // 第一次收集：将远程请求的数据（如果有）合并，以便在 **指令** 执行时能获取到最新的数据
    body = Buffer.concat(cache);

    // 监听data的改变
    // 如果改变了data的值，将cache重置为[data]
    Object.defineProperty(context, 'body', {
      get: function () {
        return body;
      },

      set: function (value) {
        body = value;
        if (typeof value === 'string') {
          cache = [new Buffer(value)];
        } else {
          cache = [value];
        }
      }
    });

    /*
     * 执行response指令，这时候修改响应内容有三种方式：
     * 1. 调用`response.write(chunk)`方法：此时直接收集write的内容（`cache.push(chunk)`）。
     * 2. 直接设置`context.data`的值：重置收集的内容（`cache=[value]`）。
     * 3. 同时使用1和2的方式：按先后顺序，收集或者重置内容。
     */
    execDirectives(ctx.proxy.rewriteRule, context, 'response');

    // 第二次收集：将指令执行完毕后的响应内容合并，以便在 **回掉函数** 执行时能获取到最新的数据
    body = Buffer.concat(cache);

    if (typeof onBeforeResponse === 'function') {
      onBeforeResponse(context);
      // 第三次收集：将回掉函数执行完毕后的响应内容合并，以便在 **response事件** 回掉函数执行时能获取到最新的数据，同时推送到浏览器中
      body = Buffer.concat(cache);
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
      body: body,
      req: req,
      res: res,
      proxy: ctx.proxy,
      encoding: encoding
    });

    // correct the `Content-Length` header
    if ('content-length' in res.headers) {
      res.headers['content-length'] = body.length;
    }
    // write headers to the browser
    res.writeHead(res.statusCode, res.statusMessage, res.headers);

    // call `oldEnd()` will call `res.write()` again，so we shold resotre the `write()` method.
    res.write = oldWrite;
    res.end = oldEnd;
    // 最后一次性推送数据到浏览器
    oldEnd.call(res, body);
  };
}

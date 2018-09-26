/**
 * @file add events or hook callbacks to `request` and `response`
 * @author zdying
 */
'use strict';

var url = require('url');
var Buffer = require('safe-buffer').Buffer;
var execDirectives = require('../../directives').execDirectives;

module.exports = function (ctx, next) {
  var hiproxy = this;
  var req = ctx.req;

  var urlInfo = url.parse(req.url);
  var needHook = urlInfo.hostname && urlInfo.hostname !== '127.0.0.1';

  if (needHook) {
    log.debug(req.url, 'need to hook `res.write()` and `res.end()` and request');
    hookRequest(hiproxy, ctx, next);
    hookResponse(hiproxy, ctx);
  } else {
    next();
  }
};

function hookRequest (hiproxy, ctx, next) {
  var req = ctx.req;
  var body = [];
  req.on('data', function (chunk) {
    if (typeof chunk === 'string') {
      chunk = new Buffer(chunk);
    }
    body.push(chunk);
  }).on('end', function () {
    body = Buffer.concat(body);

    req.body = body.toString();
    req.originalInfo = getOriginalReqInfo(req);

    next();
  });
}

function hookResponse (hiproxy, ctx) {
  var res = ctx.res;
  var req = ctx.req;
  var onData = hiproxy.options.onData;
  var onBeforeResponse = hiproxy.options.onBeforeResponse;
  var executed = false;

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

    onData.forEach(function (cbk) {
      if (typeof cbk === 'function') {
        cbkResult = cbk.call(hiproxy, {
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
    });

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

    if (!executed) {
      executed = true;

      // 监听body的改变
      // 如果改变了body的值，将cache重置为[body]
      Object.defineProperty(res, 'body', {
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
      execDirectives(ctx.proxy.rewriteRule, context, 'response').then(function () {
        // 第二次收集：将指令执行完毕后的响应内容合并，以便在 **回掉函数** 执行时能获取到最新的数据
        body = Buffer.concat(cache);

        onBeforeResponse.forEach(function (cbk) {
          if (typeof cbk === 'function') {
            cbk.call(hiproxy, context);
            // 第三次收集：将回掉函数执行完毕后的响应内容合并，以便在 **response事件** 回掉函数执行时能获取到最新的数据，同时推送到浏览器中
            body = Buffer.concat(cache);
          }
        });

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
          req: req,
          res: res,
          proxy: ctx.proxy,
          encoding: encoding
        });

        // correct the `Content-Length` header
        if (res.getHeader('Content-Length')) {
          res.setHeader('Content-Length', body.length);
        }

        // write headers to the browser
        res.writeHead(res.statusCode, res.statusMessage, res.getHeaders());

        // call `oldEnd()` will call `res.write()` again，so we shold resotre the `write()` method.
        res.write = oldWrite;
        res.end = oldEnd;
        // 最后一次性推送数据到浏览器
        oldEnd.call(res, body);
      }).catch(function (err) {
        log.error('exec directives error', err);
        log.detail(err.stack);
        res.writeHead(527, 'Proxy Error', {});
        res.write = oldWrite;
        res.end = oldEnd;
        oldEnd.call(res, '<pre>' + err.stack + '</pre>');
      });
    }
  };

  // hook `res.headers`，保证通过`res.setHeader()`设置的属性能通过`res.headers`获取到
  Object.defineProperty(res, 'headers', {
    get: function () {
      return res.getHeaders();
    },

    set: function () {
      // ignore
    }
  });
}

/**
 * Get the original request info. The info object is freezed.
 * @param {http.IncomingMessage} req http request message object
 */
function getOriginalReqInfo (req) {
  var originReq = {};
  var props = [
    'aborted',
    'headers',
    'httpVersion',
    'method',
    'rawHeaders',
    'rawTrailers',
    'statusCode',
    'statusMessage',
    'trailers',
    'url',
    'body'
  ];

  props.forEach(function (prop) {
    var type = typeof req[prop];
    var val = type === 'object' ? JSON.parse(JSON.stringify(req[prop])) : req[prop];

    originReq[prop] = val;
  });

  return originReq;
}

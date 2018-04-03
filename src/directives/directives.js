/**
 * @file rewrite指令
 * @author zdying
 */

var fs = require('fs');
var path = require('path');
var querystring = require('querystring');
var setHeader = require('./setHeader');
var getMimeType = require('simple-mime')('application/octet-stream');

// https://nodejs.org/dist/latest-v6.x/docs/api/http.html#http_message_headers
var FIELDS_SHOULD_BE_OVERWRITTEN = [
  'age', 'authorization', 'content-length', 'content-type', 'etag', 'expires', 'from',
  'host', 'if-modified-since', 'if-unmodified-since', 'last-modified', 'location',
  'max-forwards', 'proxy-authorization', 'referer', 'retry-after', 'user-agent'
];

module.exports = {
  // proxy request config
  'proxy_set_header': function (key, value) {
    log.debug('proxy_set_header -', key, value);
    var headers = this.req.headers;
    var keyLower = key.toLowerCase();
    var oldValue = headers[keyLower];

    if (keyLower in headers) {
      if (FIELDS_SHOULD_BE_OVERWRITTEN.indexOf(keyLower) !== -1) {
        // re-set the value
        headers[keyLower] = value;
      } else if (keyLower === 'set-cookie') {
        oldValue.push(value);
      } else {
        headers[keyLower] = oldValue + ', ' + value;
      }
    } else {
      if (keyLower === 'set-cookie') {
        headers[keyLower] = [value];
      } else {
        headers[keyLower] = value;
      }
    }
  },
  'proxy_hide_header': function (key) {
    var keys = [].slice.call(arguments, 0);
    var headers = this.req.headers;

    log.debug('proxy_hide_header -', keys.join(','));

    keys.forEach(function (key) {
      delete headers[key.toLowerCase()];
    });
  },
  'proxy_set_cookie': function (key, value) {
    log.debug('proxy_set_cookie -', key, value);

    var str = key + '=' + (value || '');
    var headers = this.req.headers;
    var cookie = headers.cookie || '';

    headers.cookie = (cookie ? cookie + '; ' : '') + str;
  },
  'proxy_hide_cookie': function (key) {
    var headers = this.req.headers;
    var cookie = headers.cookie;
    var keys = [].slice.call(arguments, 0);
    var cookies = [];
    var newCookie = [];

    log.debug('proxy_hide_cookie -', keys.join(','));

    if (cookie) {
      cookies = cookie.split('; ');
    }

    if (cookies.length === 0) {
      return;
    }

    if (arguments.length === 0) {
      headers.cookie = '';
    } else {
      cookies.forEach(function (_cookie) {
        if (keys.indexOf(_cookie.split('=')[0]) === -1) {
          newCookie.push(_cookie);
        }
      });

      headers.cookie = newCookie.join('; ');
    }
  },

  'proxy_method': function (key) {
    log.debug('proxy_method -', key);
    this.proxy.method = key.toUpperCase();
  },

  'proxy_set_body': function (body) {
    log.debug('proxy_set_body -', body);
    this.req.body = body;
  },

  'proxy_replace_body': function (oldValue, newValue, flag) {
    log.debug('proxy_replace_body -', oldValue, newValue);

    var body = this.req.body || '';
    var reg = /^[igm]+$/;

    if (flag && !reg.test(flag)) {
      log.warn('Invalid `proxy_replace_body` replace flag : ' + flag + ', the valid flags is `i`(ignore case) and `g`(global).');
      flag = '';
    }

    oldValue = new RegExp(oldValue, flag);

    this.req.body = body.replace(oldValue, newValue);
  },

  'proxy_append_body': function (key, value) {
    log.debug('proxy_append_body -', key, value);
    var headers = this.req.headers || {};
    var contentType = headers['content-type'];
    var body = this.req.body;
    var formURL = 'application/x-www-form-urlencoded';
    var formData = 'multipart/form-data';
    var json = 'application/json';

    if (contentType.indexOf(json) !== -1) {
      // TODO support key path (`a.b.c`)
      body = JSON.parse(body || '{}');
      body[key] = value;
      body = JSON.stringify(body);
    } else if (contentType.indexOf(formURL) !== -1 || contentType.indexOf(formData) !== -1) {
      body = querystring.parse(body || '');
      body[key] = value;
      body = querystring.stringify(body);
    }
    this.req.body = body;
  },

  'proxy_timeout': function (value) {
    var timeout = Number(value);

    if (Number.isNaN(timeout)) {
      log.warn('Invalid `proxy_timeout` directive value: ' + value + ', the value should be a number.');
    } else {
      this.proxy.timeout = timeout;
    }
  },

  // response config
  'hide_cookie': function () {
    var self = this;
    var keys = [].slice.call(arguments, 0);
    log.debug('hide_cookie -', keys.join(','));
    // TODO hide all cookie when key in empty
    keys.forEach(function (key) {
      setHeader(self.res, 'Set-Cookie', key + '=; Expires=' + new Date(1).toGMTString());
    });
  },
  'hide_header': function (key) {
    var keys = [].slice.call(arguments, 0);
    var ctx = this;

    log.debug('hide_header -', keys.join(','));

    keys.forEach(function (key) {
      delete ctx.res.headers[key.toLowerCase()];
      ctx.res.removeHeader(key);
    });
  },
  'set_header': function (key, value) {
    log.debug('set_header -', key, value);

    setHeader(this.res, key, value);
  },
  'set_cookie': function (key, value) {
    log.debug('set_cookie -', key, value);
    // TODO expires support
    setHeader(this.res, 'Set-Cookie', key + '=' + value);
  },

  'echo': function () {
    this.res.write([].join.call(arguments, ' '));
  },

  'send_file': function (value) {
    var filePath = '';
    var res = this.res;

    if (path.isAbsolute(value)) {
      // absolute path
      filePath = value;
    } else {
      // relative path
      var currentFilePath = this.rewriteRule.extends.filePath;
      var dirname = path.dirname(currentFilePath);

      filePath = path.join(dirname, value);
    }

    return new Promise(function (resolve, reject) {
      fs.readFile(filePath, 'utf-8', function (err, data) {
        if (err) {
          log.error(err);
          data = 'File send error: <br/>' + err.stack;
          res.writeHead(err.code === 'ENOENT' ? 404 : 500, {
            'Content-Type': 'text/html'
          });
        } else {
          if (!res.getHeader('content-type') && !res.headers['content-type']) {
            res.setHeader('Content-Type', getMimeType(filePath));
          }
        }

        // TODO fix bug：调用两次的后果
        res.end(data);
        // self.res.write(data);
        resolve(data);
      });
    });
  },

  'sub_filter': function (oldValue, newValue) {
    var body = this.res.body;
    var source = oldValue;
    var variables = this.rewriteRule.variables;
    var res = this.res;
    var headers = res.headers;
    var contentType = (headers['content-type'] || '').split(/\s*;\s*/)[0];
    var subFilterTypes = variables.sub_filter_types || '*';
    var subFilterOnce = variables.sub_filter_once;
    var subFilterLastModified = variables.sub_filter_last_modified;
    var needReplace = subFilterTypes === '*' || subFilterTypes.indexOf(contentType) !== -1;

    if (body && needReplace) {
      // if `sub_filter_once` is `off`, replace all the `oldValue`;
      if (subFilterOnce && subFilterOnce === 'off') {
        source = new RegExp('(' + source + ')', 'g');
      }
      this.res.body = body.toString().replace(source, newValue);

      // if `sub_filter_last_modified` is NOT `on`, remove the `Last-Modified` header.
      if (subFilterLastModified !== 'on') {
        res.removeHeader('last-modified');
        delete res.headers['last-modified'];
      }
    }
  },

  'sub_filter_once': function (value) {
    if (/^(on|off)$/.test(value)) {
      this.rewriteRule.variables.sub_filter_once = value;
    } else {
      log.warn('Invalid `sub_filter_once` directive value: ' + value + ', the value should be `on` or `off`.');
    }
  },

  'sub_filter_last_modified': function (value) {
    if (/^(on|off)$/.test(value)) {
      this.rewriteRule.variables.sub_filter_last_modified = value;
    } else {
      log.warn('Invalid `sub_filter_last_modified` directive value: ' + value + ', the value should be `on` or `off`.');
    }
  },

  'sub_filter_types': function () {
    var types = [].slice.call(arguments, 0);
    var isAllType = types.indexOf('*') !== -1;

    this.rewriteRule.variables.sub_filter_types = isAllType ? '*' : types;
  },

  /**
   * Set the response status code and status message.
   *
   * @param {Number} code The status code.
   * @param {String} [message] A optional human-readable status message.
   */
  'status': function (code, message) {
    this.res.statusCode = code;
    this.res.statusMessage = message;
  },

  // location commands
  'proxy_pass': function (value) {
    this.variables['proxy_pass'] = value;
  },
  'alias': function (value) {
    this.variables.alias = true;

    if (path.isAbsolute(value)) {
      // absolute path
      this.variables.proxy_pass = value;
    } else {
      // relative path
      var currentFilePath = this.extends.filePath;
      var dirname = path.dirname(currentFilePath);

      this.variables.proxy_pass = path.join(dirname, value);
    }
  },
  'root': function (value) {
    this.variables.default = value;
  },

  // domain commands
  'ssl_certificate': function (value) {
    var filePath = '';
    if (path.isAbsolute(value)) {
      // absolute path
      filePath = value;
    } else {
      // relative path
      var rewriteFilePath = this.extends.filePath;
      var dirname = path.dirname(rewriteFilePath);

      filePath = path.join(dirname, value);
    }

    this.variables.ssl_certificate = filePath;
  },

  'ssl_certificate_key': function (value) {
    var filePath = '';
    if (path.isAbsolute(value)) {
      // absolute path
      filePath = value;
    } else {
      // relative path
      var rewriteFilePath = this.extends.filePath;
      var dirname = path.dirname(rewriteFilePath);

      filePath = path.join(dirname, value);
    }

    this.variables.ssl_certificate_key = filePath;
  }
};

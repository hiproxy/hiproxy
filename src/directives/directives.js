/**
 * @file rewrite指令
 * @author zdying
 */

var fs = require('fs');
var path = require('path');
var setHeader = require('./setHeader');

module.exports = {
  // proxy request config
  'proxy_set_header': function (key, value) {
    log.debug('proxy_set_header -', key, value);
    var headers = this.req.headers;
    var oldValue = headers[key];

    if (Array.isArray(oldValue)) {
      oldValue.push(value);
    } else {
      headers[key] = value;
    }
  },
  'proxy_hide_header': function (key, value) {
    log.debug('proxy_hide_header -', key, value);
    delete this.req.headers[key.toLowerCase()];
  },
  'proxy_set_cookie': function (key, value) {
    log.debug('proxy_set_cookie -', key, value);

    var str = key + '=' + value;
    var headers = this.req.headers;
    var cookie = headers.cookie || '';

    headers.cookie = cookie + '; ' + str;
  },
  'proxy_hide_cookie': function (key) {
    log.debug('proxy_hide_cookie -', key);

    var headers = this.req.headers;
    var cookie = headers.cookie || '';

    headers.cookie = cookie.replace(new RegExp('(;.*)?' + key + ' *= *([^;]*) *'), '');
  },

  'proxy_method': function (key) {
    log.debug('proxy_method -', key);
    this.req.method = key.toUpperCase();
  },

  'proxy_set_body': function (body) {
    log.debug('proxy_set_body -', body);
    this.req.body = body;
  },

  'proxy_replace_body': function (oldValue, newValue) {
    log.debug('proxy_replace_body -', oldValue, newValue);

    var body = this.req.body || '';
    // TODO 正则表达式
    this.req.body = body.replace(oldValue, newValue);
  },

  'proxy_append_body': function (body) {
    log.debug('proxy_append_body -', body);

    var _body = this.req.body || '';
    this.req.body = _body + body;
  },

  // response config
  'hide_cookie': function (key) {
    log.debug('hide_cookie -', key);

    setHeader(this.res, 'Set-Cookie', key + '=; Expires=' + new Date(1).toGMTString());
  },
  'hide_header': function (key, value) {
    log.debug('hide_header -', key, value);

    delete this.res.headers[key.toLowerCase()];
    this.res.removeHeader(key);
  },
  'set_header': function (key, value) {
    log.debug('set_header -', key, value);

    setHeader(this.res, key, value);
  },
  'set_cookie': function (key, value) {
    log.debug('set_cookie -', key, value);

    setHeader(this.res, 'Set-Cookie', key + '=' + value);
  },

  'echo': function () {
    this.res.write([].join.call(arguments, ' '));
  },

  'send_file': function (value) {
    var filePath = '';
    var self = this;

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
          data = 'File send error: <br/>' + err.stack;
          self.res.writeHead(err.code === 'ENOENT' ? 404 : 500, {
            'Content-Type': 'text/html'
          });
        }

        // TODO fix bug：调用两次的后果
        self.res.end(data);
        // self.res.write(data);
        resolve(data);
      });
    });
  },

  'sub_filter': function (oldValue, newValue) {
    var body = this.body;
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
      this.body = body.toString().replace(source, newValue);

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
      log.warn('Invalid `sub_filter_once` directive value, the value should be `on` or `off`.');
    }
  },

  'sub_filter_last_modified': function (value) {
    if (/^(on|off)$/.test(value)) {
      this.rewriteRule.variables.sub_filter_last_modified = value;
    } else {
      log.warn('Invalid `sub_filter_last_modified` directive value, the value should be `on` or `off`.');
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

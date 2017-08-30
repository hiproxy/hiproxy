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
    var headers = this.request.headers;
    var oldValue = headers[key];

    if (Array.isArray(oldValue)) {
      oldValue.push(value);
    } else {
      headers[key] = value;
    }
  },
  'proxy_hide_header': function (key, value) {
    log.debug('proxy_hide_header -', key, value);
    delete this.request.headers[key.toLowerCase()];
  },
  'proxy_set_cookie': function (key, value) {
    log.debug('proxy_set_cookie -', key, value);

    var str = key + '=' + value;
    var headers = this.request.headers;
    var cookie = headers.cookie || '';

    headers.cookie = cookie + '; ' + str;
  },
  'proxy_hide_cookie': function (key) {
    log.debug('proxy_hide_cookie -', key);

    var headers = this.request.headers;
    var cookie = headers.cookie || '';

    headers.cookie = cookie.replace(new RegExp('(;.*)?' + key + ' *= *([^;]*) *'), '');
  },

  // response config
  'hide_cookie': function (key) {
    log.debug('hide_cookie -', key);

    setHeader(this.response, 'Set-Cookie', key + '=; Expires=' + new Date(1));
  },
  'hide_header': function (key, value) {
    log.debug('hide_header -', key, value);

    delete this.response.headers[key.toLowerCase()];
    this.response.removeHeader(key);
  },
  'set_header': function (key, value) {
    log.debug('set_header -', key, value);

    setHeader(this.response, key, value);
  },
  'set_cookie': function (key, value) {
    log.debug('set_cookie -', key, value);

    setHeader(this.response, 'Set-Cookie', key + '=' + value);
  },

  'echo': function () {
    this.response.write([].join.call(arguments, ' '));
  },

  'send_file': function (value) {
    var filePath = '';

    if (path.isAbsolute(value)) {
      // absolute path
      filePath = value;
    } else {
      // relative path
      var _global = this.rewriteRule.parent.parent;
      var currentFilePath = _global.filePath;
      var dirname = path.dirname(currentFilePath);

      filePath = path.join(dirname, value);
    }

    try {
      this.response.end(fs.readFileSync(filePath));
    } catch (err) {
      this.response.writeHead(err.code === 'ENOENT' ? 404 : 500, {
        'Content-Type': 'text/html'
      });
      this.response.end('File send error: <br/>' + err.stack);
    }
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
      // var _global = this.parent.parent;
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

    this.variables.sslCertificate = filePath;
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

    this.variables.sslCertificateKey = filePath;
  },

  // global commands
  'set': function (key, value) {
    this.variables[key] = value;
  }
};

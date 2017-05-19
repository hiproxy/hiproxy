/**
 * @file rewrite指令
 * @author zdying
 */

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

  // location commands
  'proxy_pass': function (value) {
    this.props.proxy = value;
  },
  'alias': function (value) {
    this.props.alias = true;

    if (/^\//.test(value)) {
      // absolute path
      this.props.proxy = value;
    } else {
      // relative path
      var _global = this.parent.parent;
      var currentFilePath = _global.filePath;
      var dirname = path.dirname(currentFilePath);

      this.props.proxy = path.join(dirname, value);
    }
  },
  'root': function (value) {
    this.props.default = value;
  },

  // domain commands
  'ssl_certificate': function (value) {
    var parent = this.parent;
    var rewriteFilePath = parent.filePath;
    var dirname = path.dirname(rewriteFilePath);

    this.props.sslCertificate = path.join(dirname, value);
  },

  'ssl_certificate_key': function (value) {
    var parent = this.parent;
    var rewriteFilePath = parent.filePath;
    var dirname = path.dirname(rewriteFilePath);

    this.props.sslCertificateKey = path.join(dirname, value);
  },

  // global commands
  'set': function (key, value) {
    this.props[key] = value;
  }
};

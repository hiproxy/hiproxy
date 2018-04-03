var fs = require('fs');
var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - send_file', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'send_file.rewrite');

  before(function () {
    testServer.listen(6789);
    proxyServer = new Proxy(8848);
    global.log = proxyServer.logger;

    proxyServer.addRewriteFile(rewriteFile);
    proxyServer.start();
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  it('should send the html file content to the client.', function () {
    // send_file ../files/index.html;
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      var body = res.body;
      var index = body.indexOf('<p>it works!</p>');

      assert.notEqual(-1, index);
    });
  });

  it('should send file with absolute file path', function () {
    var rewrite = [
      'domain test.hiproxy.org {',
      '  location / {',
      '    send_file ' + path.join(__dirname, 'files', 'index.html'),
      '  }',
      '}'
    ];

    proxyServer.addRule('rewrite', rewrite.join('\n'));

    // send_file <absolute-path>;
    return request({
      uri: 'http://test.hiproxy.org/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      var body = res.body;
      var index = body.indexOf('<p>it works!</p>');

      assert.notEqual(-1, index);
    });
  });

  it('should send file with relative file path (eg: ../conf/files.html)', function () {
    // send_file ../files/index.html;
    return request({
      uri: 'http://hiproxy.org/relative/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      var body = res.body;
      var index = body.indexOf('<p>it works!</p>');

      assert.notEqual(-1, index);
    });
  });

  it('should send file with relative file path (eg: files.html)', function () {
    // send_file senf_file.rewrite;
    return request({
      uri: 'http://hiproxy.org/relative_1/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      var body = res.body;
      var index = body.indexOf('## rewrite rules for `send_file` directive');

      assert.notEqual(-1, index);
    });
  });

  it('should send 404 content when file not exists', function () {
    // send_file ../files/file-not-exists.html;
    return request({
      uri: 'http://hiproxy.org/404/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      assert.equal(404, res.response.statusCode);
    });
  });

  it('should send 500 content when has other errors', function () {
    var old = fs.readFile;
    fs.readFile = function (filePath, encode, cbk) {
      if (typeof encode === 'function') {
        cbk = encode;
      }

      if (typeof cbk === 'function') {
        cbk(Error('Unkonw error: read ' + filePath + ' failed'));
      }
    };
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      fs.readFile = old;
      assert.equal(500, res.response.statusCode);
    });
  });

  it('should send `content-type` header based on file name', function () {
    // send_file ../files/data.json;
    return request({
      uri: 'http://hiproxy.org/json/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      var headers = res.response.headers;

      assert.equal('application/json', headers['content-type']);
    });
  });

  it('should NOT cover the original content type header', function () {
    // send_file ../files/data.json;
    // proxy_pass http://127.0.0.1:6789/content_type/;
    return request({
      uri: 'http://hiproxy.org/content_type/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      var headers = res.response.headers;

      assert.equal('text/html', headers['content-type']);
    });
  });

  it('should work with proxy_pass', function () {
    // send_file ../files/index.html;
    // proxy_pass http://127.0.0.1:6789/with_target_url/;
    return request({
      uri: 'http://hiproxy.org/with_target_url/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      var body = res.body;
      var htmlContentIndex = body.indexOf('<p>it works!</p>');
      var originContentIndex = body.indexOf('"url":"/with_target_url/"');

      assert.notEqual(-1, htmlContentIndex);
      assert.notEqual(-1, originContentIndex);
    });
  });

  it('should write file contnet after the original server-side content', function () {
    // send_file ../files/index.html;
    // proxy_pass http://127.0.0.1:6789/with_target_url/;
    return request({
      uri: 'http://hiproxy.org/with_target_url/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      var body = res.body;
      var htmlContentIndex = body.indexOf('<p>it works!</p>');
      var originContentIndex = body.indexOf('"url":"/with_target_url/"');

      assert.notEqual(-1, htmlContentIndex);
      assert.notEqual(-1, originContentIndex);
      assert.ok(htmlContentIndex > originContentIndex);
    });
  });

  it('should work with `echo` directive', function () {
    // send_file ../files/index.html;
    // echo 'content from echo';
    // proxy_pass http://127.0.0.1:6789/with_target_url/;
    return request({
      uri: 'http://hiproxy.org/with_target_url_echo/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      var body = res.body;
      var htmlContentIndex = body.indexOf('<p>it works!</p>');
      var originContentIndex = body.indexOf('"url":"/with_target_url/"');
      var echoContentIndex = body.indexOf('content from echo');

      assert.notEqual(-1, htmlContentIndex);
      assert.notEqual(-1, originContentIndex);
      assert.notEqual(-1, echoContentIndex);
    });
  });
});

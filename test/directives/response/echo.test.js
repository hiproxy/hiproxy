var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#directives - echo', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'echo.rewrite');

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

  it('should write normal string to the client.', function () {
    // echo 'It Works!';
    return request({
      uri: 'http://hiproxy.org/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      assert.equal('It Works!', res.body);
    });
  });

  it('should write html snippets', function () {
    // echo '<p style="color: red;">good afternoon.</p>';
    return request({
      uri: 'http://hiproxy.org/html/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      assert.equal('<p style="color: red;">good afternoon.</p>', res.body);
    });
  });

  it('should write all the contents (mutiple echo)', function () {
    // echo 1;
    // echo 2;
    // echo 'string';
    // echo true;
    // echo '<div style="color: orange;">finish</div>';
    return request({
      uri: 'http://hiproxy.org/multiple_echo/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      assert.equal('12stringtrue<div style="color: orange;">finish</div>', res.body);
    });
  });

  it('should write all the contents (one echo)', function () {
    // echo 1 2 'string' true '<div style="color: orange;">finish</div>';
    return request({
      uri: 'http://hiproxy.org/multiple_echo_me/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      assert.equal('1 2 string true <div style="color: orange;">finish</div>', res.body);
    });
  });

  it('should work with `proxy_pass` directive', function () {
    // echo 'It Works!';
    // echo '<script>alert(123);</script>';
    // proxy_pass http://127.0.0.1:6789/has_target_url/;
    // echo 'Echo finish.';
    return request({
      uri: 'http://hiproxy.org/has_target_url/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      var serverTypeIndex = res.body.indexOf('"serverType":"http"');
      var urlIndex = res.body.indexOf('"url":"/has_target_url/"');
      var echoIndex = res.body.indexOf('It Works!');

      assert.notEqual(-1, serverTypeIndex);
      assert.notEqual(-1, urlIndex);
      assert.notEqual(-1, echoIndex);
    });
  });

  it('should write content AFTER the remote server content', function () {
    // echo 'It Works!';
    // echo '<script>alert(123);</script>';
    // proxy_pass http://127.0.0.1:6789/has_target_url/;
    // echo 'Echo finish.';
    return request({
      uri: 'http://hiproxy.org/has_target_url/',
      proxy: 'http://127.0.0.1:8848'
    }).then(function (res) {
      var urlIndex = res.body.indexOf('"url":"/has_target_url/"');
      var allEchoContent = 'It Works!<script>alert(123);</script>Echo finish.';
      var allContentIndex = res.body.indexOf(allEchoContent);

      assert.notEqual(-1, urlIndex);
      assert.notEqual(-1, allContentIndex);
      assert.equal(true, urlIndex < allContentIndex);
    });
  });

  it('should replace the built-in variables in the content', function () {
    // set_header Content-Type application/json;
    // echo '{';
    // echo   '"host": "$host",';
    // echo   '"query_string": "$query_string",';
    // echo   '"path_name": "$path_name"';
    // echo '}';
    return request({
      uri: 'http://hiproxy.org/use_variables/?a=1&b=2',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;

      assert.deepEqual(
        {
          host: 'hiproxy.org',
          query_string: 'a=1&b=2',
          path_name: '/use_variables/?a=1&b=2_name'
        },
        body
      );
    });
  });

  it('should replace the custom variables in the content', function () {
    // set $server hiproxy;
    // echo '{';
    // echo   '"host": "$host",';
    // echo   '"server": "$server"';
    // echo '}';
    return request({
      uri: 'http://hiproxy.org/use_custom_variables/?a=1&b=2',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;

      assert.deepEqual(
        { host: 'hiproxy.org', server: 'hiproxy' },
        body
      );
    });
  });
});

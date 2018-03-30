var fs = require('fs');
var path = require('path');
var assert = require('assert');
var Proxy = require('../../../src/server');
var testServer = require('../../testServer');
var request = require('../../request');

describe('#proxy - proxy POST request', function () {
  var proxyServer;
  var rewriteFile = path.join(__dirname, 'conf', 'rewrite');

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

  it('should send POST request to the remote server', function () {
    return request({
      uri: 'http://hiproxy.org/',
      method: 'POST',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;
      assert.equal('POST', body.method);
    });
  });

  it('should send the original query string to the remote server', function () {
    return request({
      uri: 'http://hiproxy.org/?from=test&env=TEST',
      method: 'POST',
      proxy: 'http://127.0.0.1:8848',
      json: true
    }).then(function (res) {
      var body = res.body;

      assert.equal('test', body.query.from);
      assert.equal('TEST', body.query.env);
    });
  });

  it('should send the original body to the remote server', function () {
    return request({
      uri: 'http://hiproxy.org/',
      method: 'POST',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      body: {
        'a': 1,
        'b': 2
      }
    }).then(function (res) {
      var body = res.body;

      assert.equal(1, body.body.a);
      assert.equal(2, body.body.b);
    });
  });

  it('body and querystring should NOT affect each other', function () {
    return request({
      uri: 'http://hiproxy.org/?a=10&b=20&from=test&env=TEST',
      method: 'POST',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      body: {
        'a': 1,
        'b': 2
      }
    }).then(function (res) {
      var body = res.body;

      assert.equal(1, body.body.a);
      assert.equal(2, body.body.b);

      assert.equal(10, body.query.a);
      assert.equal(20, body.query.b);
      assert.equal('test', body.query.from);
      assert.equal('TEST', body.query.env);
    });
  });

  it('should properly send body containing multi-byte characters', function () {
    var data = {
      'name': '张三',
      'age': 20
    };
    var byteLength = Buffer.byteLength(JSON.stringify(data));

    return request({
      uri: 'http://hiproxy.org/?a=10&b=20&from=test&env=TEST',
      method: 'POST',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      body: data
    }).then(function (res) {
      var body = res.body;

      assert.equal('张三', body.body.name);
      assert.equal(20, body.body.age);
      assert.equal(byteLength, body.headers['content-length']);
    });
  });

  it('should properly send body containing emoji characters', function () {
    var data = {
      'name': '张三',
      'age': 20,
      'mood': '🌍😄🍆🍔'
    };
    var byteLength = Buffer.byteLength(JSON.stringify(data));

    return request({
      uri: 'http://hiproxy.org/?a=10&b=20&from=test&env=TEST',
      method: 'POST',
      proxy: 'http://127.0.0.1:8848',
      json: true,
      body: data
    }).then(function (res) {
      var body = res.body;

      assert.equal('张三', body.body.name);
      assert.equal(20, body.body.age);
      assert.equal('🌍😄🍆🍔', body.body.mood);
      assert.equal(byteLength, body.headers['content-length']);
    });
  });

  it('application/json', function () {
    var data = {
      'name': 'zdying',
      'location': 'beijing'
    };

    return request({
      uri: 'http://hiproxy.org/?a=10&b=20&from=test&env=TEST',
      method: 'POST',
      proxy: 'http://127.0.0.1:8848',
      body: data,
      json: true
    }).then(function (res) {
      var body = res.body;

      assert.equal('application/json', body.headers['content-type']);
      assert.equal(JSON.stringify(data), body.rawBody);
      assert.equal('zdying', body.body.name);
      assert.equal('beijing', body.body.location);
    });
  });

  it('application/x-www-form-urlencoded', function () {
    var data = {
      'name': 'zdying',
      'location': 'beijing'
    };

    return request({
      uri: 'http://hiproxy.org/?a=10&b=20&from=test&env=TEST',
      method: 'POST',
      proxy: 'http://127.0.0.1:8848',
      form: data
    }).then(function (res) {
      var body = JSON.parse(res.body);

      assert.equal('application/x-www-form-urlencoded', body.headers['content-type']);
      assert.equal('name=zdying&location=beijing', body.rawBody);
      assert.equal('zdying', body.body.name);
      assert.equal('beijing', body.body.location);
    });
  });

  it('multipart/form-data', function () {
    var data = {
      'name': 'zdying',
      'location': 'beijing'
    };

    return request({
      uri: 'http://hiproxy.org/?a=10&b=20&from=test&env=TEST',
      method: 'POST',
      proxy: 'http://127.0.0.1:8848',
      formData: data
    }).then(function (res) {
      var body = JSON.parse(res.body);

      assert.equal('multipart/form-data', body.headers['content-type'].split(';')[0]);
      assert.notEqual(-1, body.rawBody.indexOf('Content-Disposition: form-data; name="name"\r\n\r\nzdying'));
      assert.notEqual(-1, body.rawBody.indexOf('Content-Disposition: form-data; name="location"\r\n\r\nbeijing'));
    });
  });

  it('should send the original file to the server', function () {
    var data = {
      'name': 'zdying',
      'location': 'beijing',
      'file': {
        value: fs.createReadStream(path.join(__dirname, 'test_file.txt')),
        options: {
          filename: 'test_file.txt',
          contentType: 'text/plain'
        }
      }
    };

    return request({
      uri: 'http://hiproxy.org/?a=10&b=20&from=test&env=TEST',
      method: 'POST',
      proxy: 'http://127.0.0.1:8848',
      formData: data
    }).then(function (res) {
      var body = JSON.parse(res.body);

      assert.equal('multipart/form-data', body.headers['content-type'].split(';')[0]);
      assert.notEqual(-1, body.rawBody.indexOf('Content-Disposition: form-data; name="name"\r\n\r\nzdying'));
      assert.notEqual(-1, body.rawBody.indexOf('Content-Disposition: form-data; name="location"\r\n\r\nbeijing'));
      assert.notEqual(-1, body.rawBody.indexOf('Content-Disposition: form-data; name="file"; filename="test_file.txt"'));
      assert.notEqual(-1, body.rawBody.indexOf('Content-Type: text/plain\r\n\r\nThis is a text file.'));
    });
  });
});

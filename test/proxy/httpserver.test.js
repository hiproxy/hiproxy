var assert = require('assert');
var request = require('request');
var http = require('http');
var path = require('path');

var Proxy = require('../../src/server');
var testServer = require('../testServer');

describe('#http server', function () {
  var proxyServer;
  before(function () {
    testServer.listen(61234);

    proxyServer = new Proxy(8850);
    global.log = proxyServer.logger;

    proxyServer.addRewriteFile(path.join(__dirname, 'conf', 'rewrite'));
    proxyServer.start();
    // proxyServer.openBrowser('chrome', '127.0.0.1:8850', false);
  });

  after(function () {
    testServer.close();
    proxyServer.stop();
  });

  describe('#api', function () {
    it('#start()', function (done) {
      var server = new Proxy(8848);
      server.start().then(function () {
        if (server.httpServer instanceof http.Server) {
          done();
        } else {
          done(new Error('server.httpServer is not an instance of http.Server'));
        }
        server.stop();
      });
    });
  });

  describe('#server response', function () {
    it('request /', function (done) {
      request('http://127.0.0.1:8850', function (err, response, body) {
        if (body.indexOf('127.0.0.1:8850/proxy.pac') !== -1) {
          done();
        } else {
          done(err || new Error('Body not match'));
        }
      });
    });

    it('request /proxy.pac', function (done) {
      request('http://127.0.0.1:8850/proxy.pac', function (err, response, body) {
        if (err) {
          done(err);
        }

        assert.equal(response.statusCode, 200);
        // assert.notEqual(body.indexOf('FindProxyForURL'), -1);
        done();
      });
    });

    it('request /favicon.ico', function (done) {
      request('http://127.0.0.1:8850/favicon.ico', function (err, response, body) {
        if (err) {
          done(err);
        }

        assert.equal(response.statusCode, 200);
        assert.equal(response.headers['content-type'], 'application/x-ico');
        done();
      });
    });
  });

  describe('# proxy', function () {
    it('request t.ttt.com/', function (done) {
      request({
        uri: 'http://t.ttt.com/',
        proxy: 'http://127.0.0.1:8850',
        gzip: true,
        json: true
      }, function (err, response, body) {
        if (body && body.url === '/' && body.method === 'GET') {
          done();
        } else {
          done(err || new Error('Body not match'));
        }
      });
    });

    it('request t.ttt.com/t/ proxy ok', function (done) {
      request({
        uri: 'http://t.ttt.com/t/',
        proxy: 'http://127.0.0.1:8850',
        gzip: true,
        json: true
      }, function (err, response, body) {
        if (body.url === '/test/') {
          done();
        } else {
          done(err || new Error('Body not match'));
        }
      });
    });

    it('request t.ttt.com/t/ header ok', function (done) {
      request({
        uri: 'http://t.ttt.com/t/',
        proxy: 'http://127.0.0.1:8850',
        gzip: true,
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        var reqHeaders = body.headers;
        var resHeaders = response.headers;

        assert.equal('t.ttt.com', reqHeaders.host);
        assert.equal('hiproxy', reqHeaders.proxy_app);

        assert.equal('1', resHeaders.set_header_field_1);
        assert.deepEqual(['cookie1=c1', 'cookie2=c2'].sort(), resHeaders['set-cookie'].sort());

        done();
      });
    });

    it('request t.ttt.com/source/ (alias, root)', function (done) {
      request({
        uri: 'http://t.ttt.com/source/',
        proxy: 'http://127.0.0.1:8850'
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        var headers = response.headers;

        assert.equal('<p>hello, hiproxy</p>', body);
        assert.equal('text/html', headers['content-type']);
        assert.equal('hiproxy_static', headers.server);

        done();
      });
    });

    it('request t.ttt.com/source/a.json', function (done) {
      request({
        uri: 'http://t.ttt.com/source/a.json',
        proxy: 'http://127.0.0.1:8850'
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        var headers = response.headers;

        assert.equal('{"ret": true}', body);
        assert.equal('application/json', headers['content-type']);

        done();
      });
    });
  });

  describe('# commands', function () {
    it('request t.ttt.com/', function (done) {
      request({
        uri: 'http://t.ttt.com/t/',
        proxy: 'http://127.0.0.1:8850'
      }, function (err, response, body) {
        var headers = response.headers;
        var setHeaderField1 = headers['set_header_field_1'];

        if (setHeaderField1 === '1') {
          done();
        } else {
          done(err || new Error('`set-header` result not right'));
        }
      });
    });

    it('request t.ttt.com/', function (done) {
      request({
        uri: 'http://t.ttt.com/source/b.json',
        proxy: 'http://127.0.0.1:8850'
      }, function (err, response, body) {
        if (response.statusCode === 404) {
          done();
        } else {
          done(err || new Error('response status not right'));
        }
      });
    });

    it('should get var value rightly(location > domain > global)', function (done) {
      request({
        uri: 'http://t.ttt.com/',
        proxy: 'http://127.0.0.1:8850'
      }, function (err, response, body) {
        assert.equal(err, null);
        assert.equal(response.headers.str, 'str_domain_scope, str_location_scope');

        done();
      });
    });
  });

  describe('#Random PORT', function () {
    it('Should choose a random available port when use `(0, 0, dir)`', function (done) {
      var server = new Proxy(0, 0, process.cwd());
      server.start().then(function () {
        if (server.httpPort > 0 && server.httpsPort > 0) {
          done();
        } else {
          done(new Error('Server port not right.'));
        }
        server.stop();
      });
    });

    it('Should not choose a random available port when use `undefined` or `null`', function (done) {
      var server = new Proxy(0, undefined, process.cwd());
      server.start().then(function () {
        if (server.httpPort > 0 && Number(server.httpsPort) === 0) {
          done();
        } else {
          done(new Error('Server port not right.'));
        }
        server.stop();
      });
    });

    it('Should use user-specified port', function (done) {
      var server = new Proxy(6688, 9900, process.cwd());
      server.start().then(function () {
        if (server.httpPort === 6688 && server.httpsPort === 9900) {
          done();
        } else {
          done(new Error('Server port not right.'));
        }
        server.stop();
      });
    });

    it('Should use user-specified port(use object)', function (done) {
      var server = new Proxy({httpPort: 6699, httpsPort: 9911, dir: process.cwd()});
      server.start().then(function () {
        if (server.httpPort === 6699 && server.httpsPort === 9911) {
          done();
        } else {
          done(new Error('Server port not right.'));
        }
        server.stop();
      });
    });

    it('Should not choose a random available port when use `undefined` or `null`(use object)', function (done) {
      var server = new Proxy({httpPort: undefined, httpsPort: null, dir: process.cwd()});
      server.start().then(function () {
        if (server.httpPort > 0 && Number(server.httpsPort) === 0) {
          done();
        } else {
          done(new Error('Server port not right.'));
        }
        server.stop();
      });
    });

    it('Should choose random prot when has no params.', function (done) {
      var server = new Proxy();
      server.start().then(function () {
        if (server.httpPort > 0 && Number(server.httpsPort) === 0) {
          done();
        } else {
          done(new Error('Server port not right.'));
        }
        server.stop();
      });
    });
  });

  describe('# POST request proxy', function () {
    it('Should proxy POST request rightly', function (done) {
      request({
        uri: 'http://t.ttt.com/req_post/',
        method: 'POST',
        form: {
          a: 1,
          ab: true
        },
        proxy: 'http://127.0.0.1:8850',
        gzip: true,
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        assert.equal('POST', body.method);
        assert.equal('1', body.body.a);
        assert.equal('true', body.body.ab);

        done();
      });
    });

    // TODO 单独写测试用例测试GET／POST，以及指令
    it('Should proxy GET request to POST rightly', function (done) {
      request({
        uri: 'http://t.ttt.com/get_to_post/',
        method: 'GET',
        qs: {
          a: 1,
          ab: true
        },
        form: {aaa: 1, bbb: 2},
        // body: {aaa: 1, bbb: 2},
        proxy: 'http://127.0.0.1:8850',
        gzip: true,
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        // TODO 上面的参数，会把body都转换成JSON，需要单独测试JSON和FORM格式的问题
        assert.equal('POST', body.method);
        assert.equal('1', body.query.a);
        assert.equal('true', body.query.ab);
        assert.deepEqual({ aa: '1', bb: '2', cc: '3' }, body.body);

        done();
      });
    });

    it('Should replace body rightly', function (done) {
      request({
        uri: 'http://t.ttt.com/replace_body/',
        method: 'POST',
        form: {
          aa: 1,
          bb: 2,
          cc: 3
        },
        body: {aa: 1, bb: 2, cc: 3},
        proxy: 'http://127.0.0.1:8850',
        gzip: true,
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        assert.equal('POST', body.method);
        assert.deepEqual({ aaa: '11', bb: '2', cc: '3' }, body.body);

        done();
      });
    });

    it('Should set status to 444', function (done) {
      request({
        uri: 'http://t.ttt.com/custom_status/',
        proxy: 'http://127.0.0.1:8850',
        gzip: true,
        json: true
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        assert.equal(444, response.statusCode);
        assert.deepEqual('Just A Test Status Message', response.statusMessage);

        done();
      });
    });
  });
});

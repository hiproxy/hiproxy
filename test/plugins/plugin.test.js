require('colors');

var assert = require('assert');
// var request = require('request');
// var http = require('http');
var path = require('path');
var Args = require('hemsl');
var hiproxy = require('../../src/index');
var Proxy = hiproxy.Server;
var request = require('../request');
var pluginManager = require('../../src/plugin');
var routes = hiproxy.router;
var directives = require('../../src/directives');

describe('# plugin'.bold.green, function () {
  var proxyServer;
  var args = new Args();
  before(function () {
    // testServer.listen(6789);

    // 加载插件
    pluginManager.loadPlugins(path.join(__dirname, 'hiproxy-plugin-example/index.js'), args);

    proxyServer = global.hiproxyServer = new Proxy(8848, 8849);
    // proxyServer.addRewriteFile(path.join(__dirname, 'rewrite'));
    proxyServer.start();
  });

  after(function () {
    // testServer.close();
    proxyServer.stop();
  });

  describe('# get installed plugin', function () {
    // it('# should get all installed plugin', function () {
    //   var promise = pluginManager.getInstalledPlugins(__dirname);

    //   return promise.then(function (plugins) {
    //     var plg1 = path.join(__dirname, 'hiproxy-plugin-example');
    //     var plg2 = path.join(__dirname, 'hiproxy-plugin-demo');

    //     assert.equal(plugins.length, 2);
    //     assert.notEqual(plugins.indexOf(plg1), -1);
    //     assert.notEqual(plugins.indexOf(plg2), -1);
    //   });
    // });

    it('# should not include dir name that not begin with `hiproxy-plugin-`', function () {
      var promise = pluginManager.getInstalledPlugins(__dirname);

      return promise.then(function (plugins) {
        var plg = path.join(__dirname, 'normal-dir-name');
        assert.equal(plugins.indexOf(plg), -1);
      });
    });
  });

  describe('# commands', function () {
    it('# should add commands rightly', function () {
      var cmds = args._cmds;
      var hello = cmds.hello;

      assert.notEqual(null, hello);
      assert.equal(hello.name, 'hello');
      assert.equal(hello.describe, 'A test command that say hello to you.');
      assert.equal(typeof hello.fn, 'function');
    });

    it('# should add every command in array', function () {
      var cmds = args._cmds;
      var hello = cmds.hello;
      var hi = cmds.hi;

      assert.notEqual(null, hello);
      assert.notEqual(null, hi);
    });
  });

  describe('# routes', function () {
    it('should add pluin router to the routes object', function () {
      var addedRoutes = routes.getRoutes();

      assert.equal(typeof addedRoutes['/test(/:pageName)'], 'function');
      assert.equal(addedRoutes['/test(/:pageName)'], require('./hiproxy-plugin-example/routes')[0].render);
    });

    it('should add every route in array', function () {
      var addedRoutes = routes.getRoutes();

      assert.equal(typeof addedRoutes['/test(/:pageName)'], 'function');
      assert.equal(typeof addedRoutes['/test_api'], 'function');
    });

    it('should return the plugin router content', function () {
      return request({
        url: 'http://127.0.0.1:8848/test/server_info',
        json: true
      }).then(function (res) {
        var body = res.body;
        assert.equal('server_info', body.pageID);
        assert.equal(8848, body.serverState.http_port);
        assert.equal(8849, body.serverState.https_port);
      });
    });

    it('should use the longest router (split by `/`)', function () {
      return request({
        url: 'http://127.0.0.1:8848/test/html/'
      }).then(function (res) {
        var body = res.body;
        assert.equal('html ok', body);
      });
    });
  });

  describe('# directives', function () {
    it('should add directive function rightly', function () {
      var _directives = directives.directives;

      assert.equal(typeof _directives.add, 'function');
    });

    it('should set directive scope rightly', function () {
      var scopes = directives.scopes;
      var directiveDefine = require('./hiproxy-plugin-example/directives');
      var userScopes = directiveDefine[0].scope;

      userScopes.forEach(function (s) {
        assert.notEqual(scopes[s].indexOf('add'), -1);
      });
    });
  });
});

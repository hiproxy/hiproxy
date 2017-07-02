require('colors');

var assert = require('assert');
// var request = require('request');
// var http = require('http');
var path = require('path');
var Args = require('hemsl');

var Proxy = require('../../src/index');
var testServer = require('../testServer');
var pluginManager = require('../../src/plugin');
var routes = require('../../src/listeners/request/hiproxyRouter');
var directives = require('../../src/commands');

describe('# plugin'.bold.green, function () {
  var proxyServer;
  var args = new Args();
  before(function () {
    testServer.listen(61234);

    // 加载插件
    pluginManager.loadPlugins(path.join(__dirname, 'hiproxy-plugin-example/index.js'), args);

    proxyServer = new Proxy(8850);
    proxyServer.addRewriteFile(path.join(__dirname, 'rewrite'));
    // proxyServer.start();
  });

  after(function () {
    testServer.close();
    // proxyServer.stop();
  });

  describe('# get installed plugin', function () {
    it('# should get all installed plugin', function (done) {
      var promise = pluginManager.getInstalledPlugins(__dirname);

      promise.then(function (plugins) {
        var plg1 = path.join(__dirname, 'hiproxy-plugin-example');
        var plg2 = path.join(__dirname, 'hiproxy-plugin-demo');

        assert.equal(plugins.length, 2);
        assert.notEqual(plugins.indexOf(plg1), -1);
        assert.notEqual(plugins.indexOf(plg2), -1);
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('# should not include dir name that not begin with `hiproxy-plugin-`', function (done) {
      var promise = pluginManager.getInstalledPlugins(__dirname);

      promise.then(function (plugins) {
        var plg = path.join(__dirname, 'normal-dir-name');
        assert.equal(plugins.indexOf(plg), -1);
        done();
      }).catch(function (err) {
        done(err);
      });
    });
  });

  describe('# commands', function () {
    it('# should add commands rightly', function (done) {
      var cmds = args._cmds;
      var hello = cmds.hello;

      assert.notEqual(null, hello);
      assert.equal(hello.name, 'hello');
      assert.equal(hello.describe, 'A test command that say hello to you.');
      assert.equal(typeof hello.fn, 'function');
      done();
    });

    it('# should add every command in array', function (done) {
      var cmds = args._cmds;
      var hello = cmds.hello;
      var hi = cmds.hi;

      assert.notEqual(null, hello);
      assert.notEqual(null, hi);
      done();
    });
  });

  describe('# routes', function () {
    it('should add routes rightly', function (done) {
      var addedRoutes = routes.getRoutes();

      assert.equal(typeof addedRoutes['/test(/:pageName)'], 'function');
      assert.equal(addedRoutes['/test(/:pageName)'], require('./hiproxy-plugin-example/routes')[0].render);
      done();
    });

    it('should add every route in array', function (done) {
      var addedRoutes = routes.getRoutes();

      assert.equal(typeof addedRoutes['/test(/:pageName)'], 'function');
      assert.equal(typeof addedRoutes['/test_api'], 'function');
      done();
    });
  });

  describe('# directives', function () {
    it('should add directive function rightly', function (done) {
      var _directives = directives.directives;

      assert.equal(typeof _directives.add, 'function');
      done();
    });

    it('should set directive scope rightly', function (done) {
      var scope = directives.scope;
      var directiveDefine = require('./hiproxy-plugin-example/directives');
      var scopes = directiveDefine[0].scope;

      scopes.forEach(function (s) {
        assert.notEqual(scope[s].indexOf('add'), -1);
      });

      done();
    });
  });

  // TODO 使用网络请求进一步验证
});

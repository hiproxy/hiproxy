/**
 * @file provide system page
 * @author zdying
 */

'use strict';

var querystring = require('querystring');
var url = require('url');
var Pattern = require('url-pattern');

var homeRoute = require('./home');
var pacRoute = require('./pacFile');
var faviconRoute = require('./favicon');
var certificateRoute = require('./certificate');
var logoRoute = require('./logo');

// hiproxy system pages
var hiproxyPageRoutes = [
  '/',
  '/proxy.pac',
  '/ssl-certificate',
  '/favicon.ico',
  '/logo',
  '/logo-light'
];
// hiproxy api pages
var hiproxyAPIRoutes = [
  '/api'
];
// custom routes defined in plugins
var customPluginRoutes = {};

module.exports = {
  /**
   * 渲染hiproxy页面
   *·
   * @param {http.IncomingMessage} request 请求对象
   * @param {http.ServerResponse}  response 响应对象
   */
  render: function (request, response) {
    var urlObj = url.parse(request.url);
    // var query = urlObj.query;
    var pathname = urlObj.pathname;
    // var headers = request.headers;
    // var host = headers.host;

    if (pathname === '/') {
      homeRoute.call(this, request, response);
    } else if (pathname === '/proxy.pac') {
      pacRoute.call(this, request, response);
    } else if (pathname === '/favicon.ico') {
      faviconRoute.call(this, request, response);
    } else if (pathname === '/ssl-certificate') {
      certificateRoute.call(this, request, response);
    } else if (pathname === '/logo' || pathname === '/logo-light') {
      logoRoute.call(this, request, response);
    }
  },

  /**
   * 渲染hiproxy api页面
   *
   * @param {http.IncomingMessage} request 请求对象
   * @param {http.ServerResponse}  response 响应对象
   */
  api: function (request, response) {
    var urlObj = url.parse(request.url);
    var query = querystring.parse(urlObj.query);
    var action = query.action;
    var params = (query.params && JSON.parse(query.params)) || {};

    switch (action) {
      case 'enableFile':
        this.enableConfFile(params.fileType, params.filePath);
        break;

      case 'disableFile':
        this.disableConfFile(params.fileType, params.filePath);
        break;

      // case 'stop':
      //   this.stop();
      //   break;

      // case 'restart':
      //   this.restart();
      //   break;

      case 'open':
        this.openBrowser(
          params.browser || 'chrome',
          '127.0.0.1:' + this.httpPort,
          params.pacProxy === 'true'
        );
        break;

      default:
        if (typeof this[action] === 'function') {
          this[action]();
        }
        break;
    }

    response.end('ok');
  },

  /**
   * 添加Route
   *
   * @param {Array} routes routes配置对象数组
   */
  addRoute: function (routes) {
    if (!Array.isArray(routes)) {
      routes = [routes];
    }

    routes.forEach(function (route) {
      var _route = route.route;
      var render = route.render;

      customPluginRoutes[_route] = render;
    });
  },

  /**
   * 获取已经添加的路由信息
   */
  getRoutes: function () {
    return customPluginRoutes;
  },

  /**
   * 根据route url获取渲染方法
   *
   * @param {String} route url
   * @returns {Undefined|Function}
   */
  getRender: function (route) {
    // 绝对精确匹配
    if (hiproxyPageRoutes.indexOf(route) !== -1) {
      return this.render;
    }

    if (hiproxyAPIRoutes.indexOf(route) !== -1) {
      return this.api;
    }

    var routes = Object.keys(customPluginRoutes);
    var currRouteStr = null;
    var pattern = null;
    var matchResult = null;

    routes.sort(function (a, b) {
      return b.split('/').length - a.split('/').length;
    });

    for (var i = 0, len = routes.length; i < len; i++) {
      currRouteStr = routes[i];

      pattern = new Pattern(currRouteStr);
      matchResult = pattern.match(route);

      if (matchResult) {
        return function (req, res) {
          return customPluginRoutes[currRouteStr](matchResult, req, res);
        };
      }

      // if (!/\/$/.test(currRouteStr)) {
      //   // 定义的route是文件，完全相等才匹配
      //   if (route === currRouteStr) {
      //     return customPluginRoutes[currRouteStr];
      //   }
      // } else {
      //   // 定义的route是目录，并且请求的url以这个route开始
      //   if (route.indexOf(currRouteStr) === 0) {
      //     return customPluginRoutes[currRouteStr];
      //   }
      // }
    }
  }
};

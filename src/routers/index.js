/**
 * @file provide system page
 * @author zdying
 */

'use strict';

var querystring = require('querystring');
var path = require('path');
var url = require('url');
var fs = require('fs');
var homedir = require('os-homedir');
var Pattern = require('url-pattern');
var mustache = require('mustache');
var pluginManager = require('../plugin');

// hiproxy system pages
var hiproxyPageRoutes = [
  '/',
  '/proxy.pac',
  '/ssl-certificate',
  '/favicon.ico'
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
    var query = urlObj.query;
    var pathname = urlObj.pathname;
    var headers = request.headers;
    var host = headers.host;

    if (pathname === '/') {
      var rootURL = 'http://' + host;
      var localIP = host.split(':')[0]; // this.localIP;
      var httpPort = this.httpPort;
      var httpsPort = this.httpsPort;
      var dir = this.dir;
      var pkg = require('../../package.json');
      var homeTemplate = path.join(__dirname, 'index.html');
      var errMsg = '<p style="">hiproxy home page load error. Please refresh the page.</p>';

      response.writeHead(200, {
        'Content-Type': 'text/html'
      });

      pluginManager.getInstalledPlugins().then(function (plgs) {
        fs.readFile(homeTemplate, 'utf-8', function (err, template) {
          var html = '';
          var renderData = {};
          var colors = ['#D8E6FE', '#FDDFE5', '#FFF0DC', '#D0F1F0'];
          if (err) {
            html = errMsg;
          } else {
            renderData = {
              localIP: localIP,
              httpPort: httpPort,
              httpsPort: httpsPort || 'N/A',
              baseURL: rootURL,
              workspace: dir,
              package: pkg,
              plugins: (plgs || []).map(function (plg) {
                var name = plg.split('/').pop().replace('hiproxy-plugin-', '');
                var defaultLogo = name.charAt(0).toUpperCase();
                name = defaultLogo + name.substring(1);

                return {
                  name: name,
                  root: rootURL + '/' + name.toLowerCase(),
                  defaultLogo: defaultLogo,
                  logoColor: colors[Math.floor(Math.random() * colors.length)],
                  content: require(plg)// ,
                  // pkg: require(plg + '/package.json')
                };
              })
            };
            html = mustache.render(template, renderData);
          }

          response.end(html);
        });
      }).catch(function () {
        response.end(errMsg);
      });
    } else if (pathname === '/proxy.pac') {
      var pacFilePath = path.resolve(homedir(), '.hiproxy', 'proxy.pac');

      fs.readFile(pacFilePath, 'utf-8', function (err, str) {
        if (err) {
          log.error('read pac file error:', err);
          response.end(err.message);
        } else {
          var contentType = query && query.indexOf('type=view') !== -1 ? 'text/plain' : 'application/x-ns-proxy-autoconfig';
          response.writeHead(200, {
            'Content-Type': contentType
          });
          response.end(str);
        }
      });
    } else if (pathname === '/favicon.ico') {
      response.writeHead(200, {
        'Content-Type': 'application/x-ico'
      });
      fs.createReadStream(path.join(__dirname, 'favicon.ico')).pipe(response);
    } else if (pathname === '/ssl-certificate') {
      var certTool = require('../../src/helpers/certTool');
      var cert = certTool.getCACertificate();
      var content = cert.certificatePem;

      response.writeHead(200, {
        'Content-Disposition': 'attachment; filename="Hiproxy_Custom_CA_Certificate.crt"',
        'Content-Type': 'application/force-download',
        'Content-Transfer-Encoding': 'binary',
        'Content-Length': content.length
      });
      response.end(content);
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
      return b.split('/').length - a.split('.').length;
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

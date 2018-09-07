/**
 * @file hiproxy home page route
 * @author zdying
 */

var fs = require('fs');
var path = require('path');

var mustache = require('mustache');
var pluginManager = require('../plugin');

module.exports = function (request, response) {
  var self = this;
  var headers = request.headers;
  var host = headers.host;
  var rootURL = 'http://' + host;
  var localIP = host.split(':')[0]; // this.localIP;
  var httpPort = this.httpPort;
  var httpsPort = this.httpsPort;
  var dir = this.dir;
  var pkg = require('../../package.json');
  var homeTemplate = path.join(__dirname, 'source', 'index.html');
  var errMsg = '<p style="">hiproxy home page load error. Please refresh the page.</p>';

  response.writeHead(200, {
    'Content-Type': 'text/html'
  });

  pluginManager.getInstalledPlugins().then(function (plgs) {
    fs.readFile(homeTemplate, 'utf-8', function (err, template) {
      var html = '';
      var renderData = {};
      /* istanbul ignore if */
      if (err) {
        log.error(err.stack);
        html = errMsg;
      } else {
        renderData = {
          localIP: localIP,
          httpPort: httpPort,
          httpsPort: httpsPort || 'N/A',
          baseURL: rootURL,
          workspace: dir,
          package: pkg,
          plugins: getPkgInfos.call(self, plgs, rootURL)
        };
        html = mustache.render(template, renderData);
      }

      response.end(html);
    });
  }).catch(function () {
    response.end(errMsg);
  });
};

function getPkgInfos (plgs, rootURL) {
  var colors = ['#D8E6FE', '#FDDFE5', '#FFF0DC', '#D0F1F0'];
  var hiproxyServer = this;

  return (plgs || []).map(function (plg) {
    var plgName = plg.split(/[/\\]/).pop();
    var displayName = plgName.replace('hiproxy-plugin-', '');
    var logoLetter = displayName.charAt(0).toUpperCase();
    var pkgJSON = {};
    var plugin = require(plg);
    var repository = '';

    displayName = logoLetter + displayName.substring(1);

    try {
      pkgJSON = require(path.join(plg, 'package.json'));
      repository = pkgJSON.repository;

      if (typeof repository !== 'string' || !repository.match(/^https?:\/\/.+/)) {
        repository = repository && repository.url && repository.url.replace('git+', '');
      }
    } catch (err) {
      hiproxyServer.logger.warn(plgName, 'has no `package.json` file.');
    }

    return {
      name: plgName,
      displayName: displayName,
      root: '/' + displayName.toLowerCase(),
      logoLetter: logoLetter,
      logoColor: colors[Math.floor(Math.random() * colors.length)],
      logoURL: plugin.logoURL,
      github: repository || '',
      description: plugin.description || pkgJSON.description,
      plugin: plugin,
      package: pkgJSON
    };
  });
}

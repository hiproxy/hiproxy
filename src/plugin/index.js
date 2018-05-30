/**
 * @file Custom plugin loader
 * @author zdying
 */

'use strice';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
// var directives = require('../directives');
// var routers = require('../routers');
var pluginPrefix = 'hiproxy-plugin-';
var cache = {};

var pluginName = [];
var rootDelimitor = '%%';
module.exports = {
  getInstalledPlugins: function (root) {
    var env = process.env;

    if (env.NPM_TEST === 'true' && !root && !env.PLUGIN_ROOT) {
      root = path.join(__dirname, '..', '..', 'test', 'plugins');
    } else {
      // TODO add documentation
      root = root || env.PLUGIN_ROOT || childProcess.execSync('npm root -g').toString().trim();
    }

    // TODO 添加yarn全局安装的插件的检测
    try {
      var yarnDir = path.join(childProcess.execSync('yarn global dir').toString().trim(), 'node_modules');
      root = root + rootDelimitor + yarnDir;
    } catch (e) {
      console.debug('未使用yarn工具');
    }
    if (cache[root]) {
      return Promise.resolve(cache[root]);
    }

    return Promise.all(root.split(rootDelimitor).map(function (rootPathItem) {
      return new Promise(function (resolve, reject) {
        pushPlugin(rootPathItem, resolve, reject);
      });
    })).then(function (data) {
      return data.reduce(function (prev, next) {
        return prev.concat(next);
      }, []);
    }).then(function (data) {
      cache[root] = data;
      return data;
    });
  },

  loadPlugins: function (pluginFiles, args) {
    if (!Array.isArray(pluginFiles)) {
      pluginFiles = [pluginFiles];
    }

    pluginFiles.forEach(function (pluginFile) {
      try {
        var plugin = require(pluginFile);

        // console.log('Plugin file:', pluginFile);
        // console.log('Plugin info:', plugin);

        // 添加Commands
        var commands = plugin.commands || [];
        var canAddCommand = args && typeof args.command === 'function';
        canAddCommand && commands.forEach(function (command) {
          args.command(command);
        });

        // 添加directives
        var customDirectives = plugin.directives || [];
        customDirectives.forEach(function (directive) {
          require('../directives').addDirective(directive);
        });

        // 添加router
        var routes = plugin.routes;
        require('../routers').addRoute(routes);
      } catch (err) {
        /* istanbul ignore next */
        console.error('Plugin load error: ', pluginFile, err.message);
        // log.detail(err);
      }
    });
  }
};

function pushPlugin (pathStr, resolvePro, rejectPro) {
  var plugins = [];
  fs.readdir(pathStr, function (err, files) {
    /* istanbul ignore if */
    if (err) {
      console.error('plugin root dir read error: ', err.message);
      rejectPro(plugins);
    } else {
      files.forEach(function (file) {
        var fullPath = path.join(pathStr, file);
        try {
          var pluginNameTemp = getPluginName(fullPath);
          if (file.indexOf(pluginPrefix) === 0 && fs.statSync(fullPath).isDirectory() && !isPluginExist(pluginNameTemp)) {
            pluginName.push(pluginNameTemp);
            plugins.push(fullPath);
          }
        } catch (err) {
          /* istanbul ignore next */
          console.error('get file state error', err);
          // log && log.detail(err);
        }
      });
    }
    resolvePro(plugins);
  });
}

function getPluginName (pluginPath) {
  return path.basename(pluginPath);
}

function isPluginExist (pluginNameStr) {
  return pluginName.indexOf(pluginNameStr) !== -1;
}

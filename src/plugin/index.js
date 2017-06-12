/**
 * @file Custom plugin loader
 * @author zdying
 */

'use strice';

var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var directives = require('../commands');
var routers = require('../listeners/request/hiproxyRouter');
var pluginPrefix = 'hiproxy-plugin-';

module.exports = {
  getInstalledPlugins: function (root) {
    root = root || childProcess.execSync('npm root -g').toString().trim();

    return new Promise(function (resolve, reject) {
      fs.readdir(root, function (err, files) {
        var plugins = [];
        if (err) {
          console.error('plugin root dir read error: ', err.message);
          reject(err);
        } else {
          files.forEach(function (file) {
            var fullPath = path.join(root, file);
            try {
              if (file.indexOf(pluginPrefix) === 0 && fs.statSync(fullPath).isDirectory()) {
                plugins.push(fullPath);
              }
            } catch (err) {
              console.error('get file state error', err);
              // log && log.detail(err);
              reject(err);
            }
          });
        }

        console.log('Found', plugins.length, 'plugins', plugins);

        if (plugins.length > 0) {
          resolve(plugins);
        } else {
          reject(Error('Did not find any plugins.'));
        }
      });
    });
  },

  loadPlugins: function (pluginFiles, args) {
    if (!Array.isArray(pluginFiles)) {
      pluginFiles = [pluginFiles];
    }

    pluginFiles.forEach(function (pluginFile) {
      try {
        var plugin = require(pluginFile);

        console.log('Plugin file:', pluginFile);
        console.log('Plugin info:', plugin);

        // 添加Commands
        var commands = plugin.commands || [];
        var canAddCommand = args && typeof args.command === 'function';
        canAddCommand && commands.forEach(function (command) {
          args.command(command);
        });

        // 添加directives
        var customDirectives = plugin.directives || [];
        customDirectives.forEach(function (directive) {
          directives.addDirective(directive);
        });

        // 添加router
        var routes = plugin.routes;
        routers.addRoute(routes);
      } catch (err) {
        console.error('Plugin', plugin, 'load error: ', err.message);
        // log.detail(err);
      }
    });
  }
};

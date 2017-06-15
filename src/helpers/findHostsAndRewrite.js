/**
 * @file 在启动目录下遍历所有一级目录查找hosts文件和rewrite文件
 * @author zdying
 */

var fs = require('fs');
var path = require('path');

module.exports = function findHostsAndRewrite (dir, callback) {
  var cwd = dir || process.cwd();
  var hosts = [];
  var rewrites = [];

  // setTimeout(function(){
  log.debug('findHostsAndRewrite - find hosts and rewrite in', cwd.bold.green);
  // }, 100);

  fs.readdir(cwd, function (err, files) {
    if (err) {
      return callback(err);
    }

    files.forEach(function (file) {
      var curr = path.join(cwd, file);
      var hostPath, rewritePath;

      if (file.indexOf('.') === 0) {
        return;
      }

      if (fs.statSync(curr).isDirectory()) {
        hostPath = path.join(curr, 'hosts');
        rewritePath = path.join(curr, 'rewrite');

        try {
          if (fs.statSync(hostPath).isFile()) {
            hosts.push(hostPath);
          }
        } catch (e) {
        }

        try {
          if (fs.statSync(rewritePath).isFile()) {
            rewrites.push(rewritePath);
          }
        } catch (e) {
        }
      }
    });

    callback(null, hosts, rewrites);
  });
};

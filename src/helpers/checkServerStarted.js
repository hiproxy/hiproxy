/**
 * @file 检测是否已经启动过实例
 * @author ZHL
 */

var path = require('path');
var fs = require('fs');
var dirtool = require('../helpers/dirTool');

var hiproxyDir = dirtool.getHiproxyDir();

module.exports = function () {
  var pidFile = path.join(hiproxyDir, 'hiproxy.pid');
  var existsPid = fs.existsSync(pidFile);
  var binPath = path.resolve(__filename, '../../../bin/cli.js');
  return new Promise(function (resolve, reject) {
    if (existsPid) {
      var exec = require('child_process').exec;
      var pid = fs.readFileSync(pidFile, 'utf8');
      var cmd = process.platform === 'win32' ? 'tasklist' : 'ps aux';
      exec(cmd, function (err, stdout, stderr) {
        if (err) {
          resolve();
        }
        stdout.split('\n').forEach(function (line) {
          var p = line.trim();
          if (p.indexOf(pid) > -1 && p.indexOf(binPath) > -1) {
            reject(new Error('There is an instance of hiproxy service running, please don\'t run another server.'));
          }
          return false;
        });
        resolve();
      });
    } else {
      resolve();
    }
  });
};

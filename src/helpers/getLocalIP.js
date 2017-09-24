/**
 * @file 获取本地IP
 * @author zdying
 */

var os = require('os');

module.exports = function () {
  var IPv4 = '127.0.0.1';

  if (process.platform === 'darwin' || process.platform === 'linux') {
    for (var i = 0; i < os.networkInterfaces().en0.length; i++) {
      if (os.networkInterfaces().en0[i].family === 'IPv4') {
        IPv4 = os.networkInterfaces().en0[i].address;
      }
    }
  } else if (process.platform === 'win32') {
    for (i = 0; i < os.networkInterfaces()['本地连接'].length; i++) {
      if (os.networkInterfaces()['本地连接'][i].family === 'IPv4') {
        IPv4 = os.networkInterfaces()['本地连接'][i].address;
      }
    }
  }

  return Promise.resolve(IPv4);
};

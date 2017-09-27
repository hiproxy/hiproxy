/**
 * @file 获取本地IP
 * @author zdying
 */

var os = require('os');

module.exports = function () {
  var IPv4 = '127.0.0.1';
  var interfaces = os.networkInterfaces();

  if (process.platform === 'darwin' || process.platform === 'linux') {
    for (var key in interfaces) {
      interfaces[key].forEach(function (details) {
        if (details.family === 'IPv4' && key === 'en4' && details.address !== '127.0.0.1') {
          IPv4 = details.address;
        }
      });
    }
  } else if (process.platform === 'win32') {
    for (var i = 0; i < interfaces['本地连接'].length; i++) {
      if (os.networkInterfaces()['本地连接'][i].family === 'IPv4') {
        IPv4 = os.networkInterfaces()['本地连接'][i].address;
      }
    }
  }

  return Promise.resolve(IPv4);
};

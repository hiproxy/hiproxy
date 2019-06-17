/**
 * @file 获取本地IP
 * @author zdying
 */

var os = require('os');
var interfaces = os.networkInterfaces();

module.exports = function () {
  var IPv4 = '127.0.0.1';

  if (process.platform === 'darwin' || process.platform === 'linux') {
    for (var key in interfaces) {
      interfaces[key].find(function (details) {
        if (details.family === 'IPv4' && key === 'en0' && details.address !== '127.0.0.1') {
          IPv4 = details.address;
          return true;
        }
      });
    }
  } else if (process.platform === 'win32') {
    // 本地连接
    var keyName = '\u672C\u5730\u8FDE\u63A5';
    for (var i = 0; i < (interfaces[keyName] || []).length; i++) {
      if (interfaces[keyName][i].family === 'IPv4') {
        IPv4 = interfaces[keyName][i].address;
      }
    }
  }

  // require('dns').lookup(require('os').hostname(), function (err, add, fam) {
  //   console.log('addr: '+add);
  // })

  return IPv4;
};

/**
 * @file 获取本地IP
 * @author zdying
 */

var localIP = '';

module.exports = function () {
  return new Promise(function (resolve, reject) {
    if (localIP) {
      resolve(localIP);
      return;
    }

    require('dns').resolve(require('os').hostname(), function (err, addr) {
      if (err) {
        localIP = '127.0.0.1';
        resolve(localIP);
      } else {
        localIP = Array.isArray(addr) ? addr[0] : addr;
        resolve(localIP);
      }
    });
  });
};

/**
 * @file hiproxy proxy.pac route
 * @author zdying
 */

var fs = require('fs');
var url = require('url');
var path = require('path');
var dirtool = require('../helpers/dirTool');

module.exports = function (request, response) {
  var urlObj = url.parse(request.url);
  var query = urlObj.query;

  var pacFilePath = path.resolve(dirtool.getHiproxyDir(), 'proxy.pac');

  fs.readFile(pacFilePath, 'utf-8', function (err, str) {
    /* istanbul ignore if */
    if (err) {
      log.error('read pac file error:', err);
      response.end(err.message);
    } else {
      var contentType =
        query && query.indexOf('type=view') !== -1
          ? 'text/plain'
          : 'application/x-ns-proxy-autoconfig';

      response.writeHead(200, {
        'Content-Type': contentType
      });
      response.end(str);
    }
  });
};

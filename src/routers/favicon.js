/**
 * @file hiproxy favicon.ico route
 * @author zdying
 */

var fs = require('fs');
var path = require('path');

module.exports = function (request, response) {
  response.writeHead(200, {
    'Content-Type': 'application/x-ico'
  });
  fs.createReadStream(path.join(__dirname, 'favicon.ico')).pipe(response);
};

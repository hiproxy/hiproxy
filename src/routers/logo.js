/**
 * @file hiproxy logo
 * @author zdying
 */

var fs = require('fs');
var path = require('path');

module.exports = function (request, response) {
  var url = request.url;
  var filePath = url.replace('/statics/', '');

  filePath = path.join(__dirname, '..', '..', 'logo', filePath) + '.svg';

  response.writeHead(200, {
    'Content-Type': 'image/svg+xml'
  });
  fs.createReadStream(filePath).pipe(response);
};

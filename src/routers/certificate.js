/**
 * @file hiproxy ssl-certificate route
 * @author zdying
 */

module.exports = function (request, response) {
  var certTool = require('../../src/helpers/certTool');
  var os = require('os');
  var cert = certTool.getCACertificate();
  var content = cert.certificatePem;
  response.writeHead(200, {
    'Content-Disposition': 'attachment; filename="Hiproxy_Custom_CA_Certificate_' + os.hostname().replace(/\./g, '_') + '.crt"',
    'Content-Type': 'application/force-download',
    'Content-Transfer-Encoding': 'binary',
    'Content-Length': content.length
  });
  response.end(content);
};

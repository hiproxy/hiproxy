/**
 * @file provide system page
 * @author zdying
 */

'use strict';

var querystring = require('querystring');
var path = require('path');
var url = require('url');
var fs = require('fs');
var homedir = require('os-homedir');

module.exports = {
  render: function (route, request, response) {
    var urlObj = url.parse(request.url);
    var query = urlObj.query;

    if (route === '/') {
      var pacURL = 'http://127.0.0.1:' + this.httpPort + '/proxy.pac';
      var localIP = this.localIP;
      var httpPort = this.httpPort;
      var httpsPort = this.httpsPort;
      var message = [
        '<pre>',
        ' _     <span class="red">_</span>  ',
        '| |   <span class="red">(_)</span> ',
        '| |__  _    <span class="label">Proxy address:</span> ' + localIP + ':' + httpPort,
        '| \'_ \\| |   <span class="label">Https address:</span> ' + (httpsPort ? localIP + ':' + httpsPort : 'disabled'),
        '| | | | |   <span class="label">Proxy file at:</span> <a href="' + pacURL + '?type=view">' + pacURL + '</a>',
        '|_| |_|_| ',
        '</pre>'
      ];

      response.writeHead(200, {
        'Content-Type': 'text/html'
      });
      response.write('<style>.red{color: #DC544B} .label{color: #10a3ca; font-weight: bold}</style>');
      // response.write('<h1>hiproxy server</h1>');
      response.write(message.join('\n'));
      response.end();
    } else if (route === '/proxy.pac') {
      var pacFilePath = path.resolve(homedir(), '.hiproxy', 'proxy.pac');

      fs.readFile(pacFilePath, 'utf-8', function (err, str) {
        if (err) {
          log.error('read pac file error:', err);
          response.end(err.message);
        } else {
          var contentType = query && query.indexOf('type=view') !== -1 ? 'text/plain' : 'application/x-ns-proxy-autoconfig';
          response.writeHead(200, {
            'Content-Type': contentType
          });
          response.end(str);
        }
      });
    } else if (route === '/favicon.ico') {
      response.end('');
    }
  },

  api: function (route, request, response) {
    var urlObj = url.parse(request.url);
    var query = querystring.parse(urlObj.query);
    var action = query.action;
    var params = query.params;

    switch (action) {
      case 'stop':
        this.stop();
        break;

      case 'restart':
        this.restart();
        break;

      case 'open':
        this.openBrowser(
          params.browser || 'chrome',
          '127.0.0.1:' + this.httpPort,
          params.pacProxy === 'true'
        );
        break;
    }

    response.end('ok');
  }
};

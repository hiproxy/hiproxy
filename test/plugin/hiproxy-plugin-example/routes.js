module.exports = [
  {
    route: '/test(/:pageName)',
    render: function (route, request, response) {
      response.writeHead(200, {
        'Content-Type': 'text/html',
        'Powder-By': 'hiproxy-plugin-example'
      });

      var serverInfo = {
        route: route,
        pageID: route.pageName,
        time: new Date(),
        serverState: {
          http_port: global.hiproxyServer.httpPort,
          https_port: global.hiproxyServer.httpsPort,
          cliArgs: global.args,
          process_id: process.pid
        }
      };

      response.end('<pre>' + JSON.stringify(serverInfo, null, 4) + '</pre>');
    }
  },

  {
    route: '/test_api',
    render: function (route, request, response) {
      response.end('ok');
    }
  }
];

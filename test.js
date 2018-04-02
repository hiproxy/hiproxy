var http = require('http');

http.createServer(function (req, res) {
  res.setHeader('Content-Length', 1);
  res.setHeader('Content-Length', 2);

  res.setHeader('A', '1');
  res.setHeader('A', '2');
  res.setHeader('A', '3');

  res.headers = {};
  res.headers.B = 1;

  res.end('ok');
}).listen(9900);

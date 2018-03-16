const fs = require('fs');
const path = require('path');
const http = require('http');

var server = http.createServer((req, res) => {
  const oldEnd = res.end;

  let body = [];
  let hasEncoding = false;

  res.write = function (chunk, encoding) {
    console.log(typeof chunk);
    body.push(chunk);
  };

  res.end = function () {
    body = hasEncoding ? body.join('') : Buffer.concat(body).toString();
    oldEnd.call(res, '<!-- you have been hacked. -->' + body);
  };

  fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
});

server.listen(8888);

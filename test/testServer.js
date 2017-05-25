/**
 * @file HTTP测试服务器，将收到的请求信息以JSON格式返回
 * @author zdying
 */

var http = require('http');
var url = require('url');
var zlib = require('zlib');
var querystring = require('querystring');

var server = http.createServer(function (req, res) {
  var body = '';
  req.on('data', function (chunk) {
    body += chunk.toString();
  });

  req.on('end', function () {
    var urlObj = url.parse(req.url, true);
    var query = urlObj.query;

    var info = {
      url: req.url,
      headers: req.headers,
      query: query,
      method: req.method,
      httpVersion: req.httpVersion,
      body: querystring.parse(body)
    };

    var acceptEncoding = req.headers['accept-encoding'];
    if (!acceptEncoding) {
      acceptEncoding = '';
    }

    if (acceptEncoding.match(/\bgzip\b/)) {
      zlib.gzip(query.responseBody || JSON.stringify(info), function (err, result) {
        var statusCode = query.statusCode || 200;
        if (err) {
          statusCode = 500;
          result = err;
          res.end(err);
        }
        res.writeHead(statusCode, {
          'Content-Type': query.contentType || 'application/json',
          'Server': 'Hiproxy Test Server',
          'Content-Encoding': 'gzip'
        });
        res.end(result);
      });
    } else {
      res.writeHead(query.statusCode || 200, {
        'Content-Type': query.contentType || 'application/json',
        'Server': 'Hiproxy Test Server'
      });
      res.end(query.responseBody || JSON.stringify(info));
    }
  });
});

exports.listen = function () {
  server.listen.apply(server, arguments);
};

exports.close = function (callback) {
  server.close(callback);
};

// exports.listen(4000)

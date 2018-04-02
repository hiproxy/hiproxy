/**
 * @file HTTP测试服务器，将收到的请求信息以JSON格式返回
 * @author zdying
 */

var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var url = require('url');
var zlib = require('zlib');
var querystring = require('querystring');

var server = http.createServer(cbk.bind(null, 'http'));
var serverHTTPS = https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'localhost.key')),
  cert: fs.readFileSync(path.join(__dirname, 'localhost.pem'))
}, cbk.bind(null, 'https'));

function cbk (type, req, res) {
  var body = '';
  req.on('data', function (chunk) {
    body += chunk.toString();
  });

  req.on('end', function () {
    var urlObj = url.parse(req.url, true);
    var query = urlObj.query;
    var contentType = req.headers['content-type'] || '';
    var cookie = req.headers.cookie || '';
    var isJSON = contentType.indexOf('application/json') !== -1;
    var bodyObj = {};

    try {
      bodyObj = isJSON ? JSON.parse(body) : querystring.parse(body);
    } catch (err) {
      bodyObj = {};
    }

    var info = {
      serverType: type,
      url: req.url,
      headers: req.headers,
      query: query,
      method: req.method,
      httpVersion: req.httpVersion,
      body: bodyObj,
      rawBody: body,
      cookie: parseCookie(cookie),
      rawCookie: cookie
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
          'I-Love': 'hiproxy',
          'Content-Encoding': 'gzip'
        });
        res.end(result);
      });
    } else {
      res.writeHead(query.statusCode || 200, {
        'Content-Type': query.contentType || 'application/json',
        'Server': 'Hiproxy Test Server',
        'I-Love': 'hiproxy'
      });
      res.end(query.responseBody || JSON.stringify(info));
    }
  });
}

function parseCookie (str) {
  return str.split(';').map(function (field) {
    var arr = field.trim().split('=');
    return [arr[0], arr.slice(1).join('=')];
  }).reduce(function (acc, curr) {
    acc[curr[0]] = curr[1];
    return acc;
  }, {});
}

exports.listen = function () {
  server.listen.apply(server, arguments);
};

exports.close = function (callback) {
  server.close(callback);
};

exports.listenHTTPS = function () {
  serverHTTPS.listen.apply(serverHTTPS, arguments);
};

exports.closeHTTPS = function (callback) {
  serverHTTPS.close(callback);
};

// exports.listen(4000)
// exports.listenHTTPS(4001)

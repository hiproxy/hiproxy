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

var resString = 'This is some test text for hiproxy TEST Case. Only for test.';
var str = '你好！ Hello привет สวัสดี 안녕하세요. こんにちは';
var emoji = '🌍🔗🎈';

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
    var cookieObj = parseCookie(cookie);
    var resCookie = [];

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
      cookie: cookieObj,
      rawCookie: cookie,
      resString: resString,
      str: str,
      emoji: emoji
    };

    for (var key in cookieObj) {
      resCookie.push(key + '=' + cookieObj[key]);
    }
    res.setHeader('Set-Cookie', resCookie);

    var acceptEncoding = req.headers['accept-encoding'];
    if (!acceptEncoding) {
      acceptEncoding = '';
    }

    var resResult = query.responseBody || JSON.stringify(info);

    if (acceptEncoding.match(/\bgzip\b/) && query.gzip !== 'false') {
      zlib.gzip(resResult, function (err, result) {
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
          'Res-Header-1': '1',
          'Res-Header-2': '2',
          'Content-Encoding': 'gzip',
          'last-modified': new Date().toUTCString()
        });
        res.end(result);
      });
    } else {
      res.writeHead(query.statusCode || 200, {
        'Content-Type': query.contentType || 'application/json',
        'Server': 'Hiproxy Test Server',
        'I-Love': 'hiproxy',
        'Res-Header-1': '1',
        'Res-Header-2': '2',
        'last-modified': new Date().toUTCString(),
        'Content-Length': Buffer.byteLength(resResult)
      });
      res.end(resResult);
    }
  });
}

function parseCookie (str) {
  if (!str) {
    return {};
  }
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

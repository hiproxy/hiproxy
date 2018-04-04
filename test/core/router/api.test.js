/**
 * @file hiproxy system router test case
 * @author zdying
 */
'use strict';

var assert = require('assert');
var request = require('../../request');
var Proxy = require('../../../src/index').Server;

describe('#system router', function () {
  var proxyServer;
  var port = 9991;
  before(function () {
    proxyServer = new Proxy(port);
    global.log = proxyServer.logger;
    proxyServer.addRule('hosts', '127.0.0.1 hiproxy.org');
    proxyServer.start();
  });

  after(function () {
    proxyServer.stop();
  });

  describe('hiproxy home page', function () {
    it('should return the home page', function () {
      return reqAndCheck(
        'http://127.0.0.1:9991/',
        {
          'content-type': 'text/html'
        }
      );
    });
  });

  describe('hiproxy web api', function () {
    it('should call the api', function () {
      return request({
        uri: 'http://127.0.0.1:9991/api?action=testWebAPI'
      }).then(function (res) {
        assert.equal(proxyServer.testWebAPICalled, true);
        assert.equal(res.body, 'ok');
      });
    });
  });

  describe('hiproxy logo image', function () {
    it('should return the logo image', function () {
      return reqAndCheck(
        'http://127.0.0.1:9991/logo',
        {
          'content-type': 'image/svg+xml'
        }
      );
    });

    it('should return the logo image(light version)', function () {
      return reqAndCheck(
        'http://127.0.0.1:9991/logo-light',
        {
          'content-type': 'image/svg+xml'
        }
      );
    });
  });

  describe('hiproxy root certificate', function () {
    it('should return the root CA certificate', function () {
      return reqAndCheck(
        'http://127.0.0.1:9991/ssl-certificate',
        {
          'content-type': 'application/force-download',
          'content-disposition': 'attachment; filename="Hiproxy_Custom_CA_Certificate.crt"'
        }
      );
    });
  });

  describe('hiproxy others', function () {
    it('should return the favicon icon', function () {
      return reqAndCheck(
        'http://127.0.0.1:9991/favicon.ico',
        {
          'content-type': 'application/x-ico'
        }
      );
    });

    it('should return the proxy pac file', function () {
      return reqAndCheck(
        'http://127.0.0.1:9991/proxy.pac',
        {
          'content-type': 'application/x-ns-proxy-autoconfig'
        }
      );
    });

    it('should return the proxy pac file (text preview)', function () {
      return reqAndCheck(
        'http://127.0.0.1:9991/proxy.pac?type=view',
        {
          'content-type': 'text/plain'
        }
      );
    });
  });
});

function reqAndCheck (url, checkHeaders) {
  return request({
    uri: url
  }).then(function (res) {
    var headers = res.response.headers;

    for (var key in checkHeaders) {
      assert.equal(headers[key], checkHeaders[key]);
    }

    assert.notEqual(res.body.length, 0);
  });
}

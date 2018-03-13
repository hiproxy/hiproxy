/**
 * @file hiproxy system router test case
 * @author zdying
 */
'use strict';

var assert = require('assert');
var request = require('request');

var Proxy = require('../../src/server');

describe('#hiporxy system router', function () {
  var proxyServer;
  var port = 9991;
  before(function () {
    proxyServer = new Proxy(port);
    proxyServer.start();
  });

  after(function () {
    proxyServer.stop();
  });

  describe('hiproxy home page', function () {
    it('should return the home page', function (done) {
      reqAndCheck(
        done,
        'http://127.0.0.1:9991/',
        {
          'content-type': 'text/html'
        }
      );
    });
  });

  describe('hiproxy web api', function () {
    it('should call the api', function (done) {
      request({
        uri: 'http://127.0.0.1:9991/api?action=testWebAPI'
      }, function (err, response, body) {
        if (err) {
          return done(err);
        }

        assert.equal(proxyServer.testWebAPICalled, true);
        assert.equal(body, 'ok');

        done();
      });
    });
  });

  describe('hiproxy logo image', function () {
    it('should return the logo image', function (done) {
      reqAndCheck(
        done,
        'http://127.0.0.1:9991/logo',
        {
          'content-type': 'image/svg+xml'
        }
      );
    });

    it('should return the logo image(light version)', function (done) {
      reqAndCheck(
        done,
        'http://127.0.0.1:9991/logo-light',
        {
          'content-type': 'image/svg+xml'
        }
      );
    });
  });

  describe('hiproxy root certificate', function () {
    it('should return the root CA certificate', function (done) {
      reqAndCheck(
        done,
        'http://127.0.0.1:9991/ssl-certificate',
        {
          'content-type': 'application/force-download',
          'content-disposition': 'attachment; filename="Hiproxy_Custom_CA_Certificate.crt"'
        }
      );
    });
  });

  describe('hiproxy others', function () {
    it('should return the favicon icon', function (done) {
      reqAndCheck(
        done,
        'http://127.0.0.1:9991/favicon.ico',
        {
          'content-type': 'application/x-ico'
        }
      );
    });

    it('should return the proxy pac file', function (done) {
      reqAndCheck(
        done,
        'http://127.0.0.1:9991/proxy.pac',
        {
          'content-type': 'application/x-ns-proxy-autoconfig'
        }
      );
    });

    it('should return the proxy pac file (text preview)', function (done) {
      reqAndCheck(
        done,
        'http://127.0.0.1:9991/proxy.pac?type=view',
        {
          'content-type': 'text/plain'
        }
      );
    });
  });
});

function reqAndCheck (done, url, checkHeaders) {
  request({
    uri: url
  }, function (err, response, body) {
    if (err) {
      return done(err);
    }

    var headers = response.headers;

    for (var key in checkHeaders) {
      assert.equal(headers[key], checkHeaders[key]);
    }

    assert.notEqual(body.length, 0);

    done();
  });
}

var assert = require('assert');
var dns = require('dns');

describe('#getLocalIP', function () {
  describe('get local ip success', function () {
    var dnsResolve = null;

    before(function () {
      // delete cache
      delete require.cache[require.resolve('../../src/helpers/getLocalIP')];
      dnsResolve = dns.resolve;
      dns.resolve = function (host, callback) {
        callback(null, '192.168.1.100');
      };
    });

    it('should return the local ip', function (done) {
      var getLocalIP = require('../../src/helpers/getLocalIP');
      getLocalIP().then(function (ip) {
        assert.equal(/^(\d{1,3})(\.\d{1,3}){3}$/.test(ip), true);

        done();
      }).catch(function (err) {
        done(err);
      });
    });

    after(function () {
      dns.resolve = dnsResolve;
    });
  });

  describe('get local ip fail', function () {
    var dnsResolve = null;

    before(function () {
      // delete cache
      delete require.cache[require.resolve('../../src/helpers/getLocalIP')];

      dnsResolve = dns.resolve;
      dns.resolve = function (host, callback) {
        callback(new Error('resolve fail'));
      };
    });

    it('should return 127.0.0.1 when get ip fail', function (done) {
      var getLocalIP = require('../../src/helpers/getLocalIP');
      getLocalIP().then(function (ip) {
        assert.equal(ip, '127.0.0.1');
        done();
      }).catch(function (err) {
        assert.equal(err, null);
        done();
      });
    });

    after(function () {
      dns.resolve = dnsResolve;
    });
  });
});

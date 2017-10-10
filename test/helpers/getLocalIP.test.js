var assert = require('assert');
var os = require('os');

describe('#getLocalIP', function () {
  describe('get local ip success', function () {
    var osNetworkInterfaces = null;

    before(function () {
      // delete cache
      delete require.cache[require.resolve('../../src/helpers/getLocalIP')];

      osNetworkInterfaces = os.networkInterfaces;
      os.networkInterfaces = function () {
        return {
          'lo0': [
            {
              'address': '127.0.0.1',
              'netmask': '255.0.0.0',
              'family': 'IPv4',
              'mac': '00:00:00:00:00:00',
              'internal': true
            }
          ],
          'en4': [
            {
              'address': '100.81.128.118',
              'netmask': '255.255.252.0',
              'family': 'IPv4',
              'mac': '08:6d:41:e5:94:c6',
              'internal': false
            }
          ],
          'bridge100': [
            {
              'address': '192.168.2.1',
              'netmask': '255.255.255.0',
              'family': 'IPv4',
              'mac': '36:36:3b:ac:a6:64',
              'internal': false
            }
          ]
        };
      };
    });

    it('should return the local ip', function (done) {
      var getLocalIP = require('../../src/helpers/getLocalIP');
      var ip = getLocalIP();
      assert.equal(ip, '100.81.128.118');
      done();
    });

    after(function () {
      os.networkInterfaces = osNetworkInterfaces;
    });
  });

  describe('get local ip fail', function () {
    var osNetworkInterfaces = null;

    before(function () {
      // delete cache
      delete require.cache[require.resolve('../../src/helpers/getLocalIP')];

      osNetworkInterfaces = os.networkInterfaces;
      os.networkInterfaces = function () {
        return null;
      };
    });

    it('should return 127.0.0.1 when get ip fail', function (done) {
      var getLocalIP = require('../../src/helpers/getLocalIP');
      var ip = getLocalIP();
      assert.equal(ip, '127.0.0.1');
      done();
    });

    after(function () {
      os.networkInterfaces = osNetworkInterfaces;
    });
  });
});

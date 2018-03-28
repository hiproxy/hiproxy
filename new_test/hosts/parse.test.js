var assert = require('assert');
var path = require('path');
var Hosts = require('../../src/hosts');
var Logger = require('../../src/logger');
require('colors');

global.args = {};
global.log = new Logger();

describe('#hosts - parse', function () {
  var hosts = new Hosts();
  var rules = null;

  hosts.addFile(path.join(__dirname, 'conf', '_hosts'));
  rules = hosts.getHost();

  it('Parse hosts rules to object', function () {
    assert.ok(rules && typeof rules === 'object');
  });

  it('One IP and one domain: 127.0.0.1 single.hiproxy.org', function () {
    // 127.0.0.1 single.hiproxy.org
    assert.equal('127.0.0.1', rules['single.hiproxy.org']);
  });

  it('One IP multiple domains: 192.168.0.1 hiproxy.org www.hiproxy.org', function () {
    // 192.168.0.1 hiproxy.org www.hiproxy.org
    assert.equal('192.168.0.1', rules['hiproxy.org']);
    assert.equal('192.168.0.1', rules['www.hiproxy.org']);
  });

  it('With port number: 127.0.0.1:8081 demo.hiproxy.org', function () {
    // 127.0.0.1:8081 demo.hiproxy.org
    assert.equal('127.0.0.1:8081', rules['demo.hiproxy.org']);
  });

  it('With port number: 192.168.0.1:89 doc.hiproxy.org blog.hiproxy.org home.hiproxy.org', function () {
    // 192.168.0.1:89 doc.hiproxy.org blog.hiproxy.org home.hiproxy.org
    assert.equal('192.168.0.1:89', rules['doc.hiproxy.org']);
    assert.equal('192.168.0.1:89', rules['blog.hiproxy.org']);
    assert.equal('192.168.0.1:89', rules['home.hiproxy.org']);
  });

  it('Rules: # 192.168.0.1:81 hiproxy.hiproxy.org', function () {
    assert.ok(!('hiproxy.hiproxy.org' in rules));
  });

  it('Invalid rule: 11.22.33.44 hiproxy.org/def', function () {
    assert.ok(!('hiproxy.org/def' in rules));
  });

  it('Invalid rule: 12.34.56.78', function () {
    assert.equal(-1, JSON.stringify(rules).indexOf('12.34.56.78'));
  });
});

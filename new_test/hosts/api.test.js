var assert = require('assert');
var path = require('path');
var Hosts = require('../../src/hosts');
var Logger = require('../../src/logger');
require('colors');

global.args = {};
global.log = new Logger();

describe('#hosts - API', function () {
  var hosts = new Hosts();
  var rules = null;
  var filePath = path.join(__dirname, '_hosts_1');

  hosts.addFile(filePath);

  it('addFile()', function () {
    rules = hosts.getHost();
    assert.equal('10.86.10.86', rules['www.hiproxy.org']);
  });

  it('deleteFile()', function () {
    hosts.deleteFile(filePath);
    rules = hosts.getHost();

    assert.equal(0, Object.keys(rules));
    assert.equal(undefined, rules['www.hiproxy.org']);
  });

  it('disableFile()', function () {
    hosts.addFile(filePath);

    rules = hosts.getHost();
    assert.equal('10.86.10.86', rules['www.hiproxy.org']);

    hosts.disableFile(filePath);
    rules = hosts.getHost();
    assert.equal(undefined, rules['www.hiproxy.org']);
  });

  it('enableFile()', function () {
    hosts.enableFile(filePath);
    rules = hosts.getHost();
    assert.equal('10.86.10.86', rules['www.hiproxy.org']);
  });

  it('addRule()', function () {
    var hosts = new Hosts();
    hosts.addRule('10.11.12.13 addrule.hiproxy.org', 'snippet-1');
    hosts.addRule('10.11.12.14 addrule1.hiproxy.org addrule2.hiproxy.org', 'snippet-2');
    hosts.addRule('10.11.12.15:81 addrule3.hiproxy.org', 'snippet-3');

    rules = hosts.getHost();
    assert.equal('10.11.12.13', rules['addrule.hiproxy.org']);
    assert.equal('10.11.12.14', rules['addrule1.hiproxy.org']);
    assert.equal('10.11.12.14', rules['addrule2.hiproxy.org']);
    assert.equal('10.11.12.15:81', rules['addrule3.hiproxy.org']);
  });

  it('clearRules()', function () {
    var hosts = new Hosts();
    hosts.addRule('10.11.12.13 addrule.hiproxy.org', 'snippet-1');
    rules = hosts.getHost();
    assert.equal('10.11.12.13', rules['addrule.hiproxy.org']);

    hosts.clearRules();
    rules = hosts.getHost();
    assert.equal(undefined, rules['addrule.hiproxy.org']);
  });

  it('clearFiles()', function () {
    var hosts = new Hosts();
    var rules = null;
    var filePath = path.join(__dirname, '_hosts_1');

    hosts.addFile(filePath);

    rules = hosts.getHost();
    assert.equal('10.86.10.86', rules['www.hiproxy.org']);

    hosts.clearFiles();
    rules = hosts.getHost();
    assert.equal(undefined, rules['www.hiproxy.org']);
  });

  it('getHost()', function () {
    var hosts = new Hosts();
    hosts.addRule();
    hosts.addRule('10.11.12.13 doc.hiproxy.org blog.hiproxy.org');

    rules = hosts.getHost();
    assert.equal('10.11.12.13', rules['doc.hiproxy.org']);
    assert.equal('10.11.12.13', rules['blog.hiproxy.org']);

    var rule = hosts.getHost('doc.hiproxy.org');
    var rule1 = hosts.getHost('blog.hiproxy.org');
    var rule2 = hosts.getHost('en.hiproxy.org');

    assert.equal('10.11.12.13', rule);
    assert.equal('10.11.12.13', rule1);
    assert.equal(undefined, rule2);
  });
});

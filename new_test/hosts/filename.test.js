var assert = require('assert');
var path = require('path');
var Hosts = require('../../src/hosts');
var Logger = require('../../src/logger');
require('colors');

global.args = {};
global.log = new Logger();

describe('#hosts - API', function () {
  var filePath = path.join(__dirname, '_hosts_1');

  it('Real file name', function () {
    var hosts = new Hosts();
    hosts.addFile(filePath);

    assert.equal(true, filePath in hosts._files);
    assert.equal('10.86.10.86', hosts._files[filePath].result['www.hiproxy.org']);
  });

  it('File name by user', function () {
    var hosts = new Hosts();

    hosts.addRule('10.11.12.13 addrule.hiproxy.org', 'snippet-1');

    assert.equal(true, 'snippet-1' in hosts._files);
    assert.equal('10.11.12.13', hosts._files['snippet-1'].result['addrule.hiproxy.org']);
  });

  it('Random file name', function () {
    var hosts = new Hosts();

    hosts.addRule('10.11.12.13 addrule.hiproxy.org');

    var files = Object.keys(hosts._files);

    assert.equal(1, files.length);
    assert.equal('10.11.12.13', hosts._files[files[0]].result['addrule.hiproxy.org']);
  });

  it('Update rules by set the `source` value', function () {
    var hosts = new Hosts();

    hosts.addRule('10.11.12.13 addrule.hiproxy.org', 'my-test-file');

    var fileInfo = hosts._files['my-test-file'];

    assert.equal('10.11.12.13', fileInfo.result['addrule.hiproxy.org']);

    fileInfo.source = '10.11.12.13 addrule.hiproxy.org addrule1.hiproxy.org';

    assert.equal('10.11.12.13', fileInfo.result['addrule.hiproxy.org']);
    assert.equal('10.11.12.13', fileInfo.result['addrule1.hiproxy.org']);
  });
});

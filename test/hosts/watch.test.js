var assert = require('assert');
var path = require('path');
var fs = require('fs');
var Hosts = require('../../src/hosts');
var Logger = require('../../src/logger');
require('colors');

global.args = {};
global.log = new Logger();

describe('#hosts - Watch file change', function () {
  var filePath = path.join(__dirname, 'conf', 'hosts_1000');
  var filePath1 = path.join(__dirname, 'conf', 'hosts_1001');
  var oldContent = ['11.22.33.44 file.hiproxy.org'];
  var newContent = ['11.22.33.44 file.hiproxy.org', '12.34.56.78 blog.hiproxy.org', '123.123.110.110 www.hiproxy.org'];

  after(function () {
    fs.writeFileSync(filePath, oldContent.join('\n'));
    fs.writeFileSync(filePath1, oldContent.join('\n'));
  });

  it('wath file change', function (done) {
    var hosts = new Hosts();
    hosts.addFile(filePath);

    var rules = hosts.getHost();

    assert.equal('11.22.33.44', rules['file.hiproxy.org']);

    fs.writeFile(filePath, newContent.join('\n'), function (err) {
      if (err) {
        return done(err);
      }
      setTimeout(function () {
        rules = hosts.getHost();

        assert.equal('11.22.33.44', rules['file.hiproxy.org']);
        assert.equal('123.123.110.110', rules['www.hiproxy.org']);
        assert.equal('12.34.56.78', rules['blog.hiproxy.org']);

        done();
      }, 600);
    });
  });

  it('delete file', function (done) {
    var hosts = new Hosts();
    hosts.addFile(filePath1);

    var rules = hosts.getHost();
    assert.equal('11.22.33.44', rules['file.hiproxy.org']);

    fs.unlink(filePath1, function (err) {
      if (err) {
        return done(err);
      }
      setTimeout(function () {
        rules = hosts.getHost();
        assert.equal(undefined, rules['file.hiproxy.org']);
        done();
      }, 600);
    });
  });
});

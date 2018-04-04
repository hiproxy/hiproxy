var assert = require('assert');
var path = require('path');
var fs = require('fs');
var Rewrite = require('../../src/rewrite');
var Logger = require('../../src/logger');
require('colors');

global.args = {};
global.log = new Logger();

describe('#rewrite - Watch file change', function () {
  var filePath = path.join(__dirname, 'conf', 'rewrite_1000');
  var filePath1 = path.join(__dirname, 'conf', 'rewrite_1001');
  var oldContent = [
    'hiproxy.org => { location / { echo "test"; } }'
  ];
  var newContent = [
    'hiproxy.org => { location / { echo "test"; } }',
    'en.hiproxy.org, zh.hiproxy.org => { location / { echo "documentation"; } }'
  ];

  after(function () {
    fs.writeFileSync(filePath, oldContent.join('\n'));
    fs.writeFileSync(filePath1, oldContent.join('\n'));
  });

  it('wath file change', function (done) {
    var rewrite = new Rewrite();
    rewrite.addFile(filePath);

    var rules = rewrite.getRule();

    assert.equal(1, rules['hiproxy.org'].length);

    fs.writeFile(filePath, newContent.join('\n'), function (err) {
      if (err) {
        return done(err);
      }
      setTimeout(function () {
        rules = rewrite.getRule();

        assert.equal(1, rules['hiproxy.org'].length);

        assert.equal(1, rules['en.hiproxy.org'].length);
        assert.equal(1, rules['zh.hiproxy.org'].length);

        done();
      }, 600);
    });
  });

  it('delete file', function (done) {
    var rewrite = new Rewrite();
    rewrite.addFile(filePath1);

    var rules = rewrite.getRule();
    assert.equal(1, rules['hiproxy.org'].length);

    fs.unlink(filePath1, function (err) {
      if (err) {
        return done(err);
      }
      setTimeout(function () {
        rules = rewrite.getRule();
        assert.equal(undefined, rules['hiproxy.org']);
        done();
      }, 600);
    });
  });
});

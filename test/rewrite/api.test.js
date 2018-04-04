var assert = require('assert');
var path = require('path');
var Rewrite = require('../../src/rewrite');
var Logger = require('../../src/logger');
require('colors');

global.args = {};
global.log = new Logger();

describe('#rewrite - API', function () {
  var rewrite = new Rewrite();
  var rules = null;
  var filePath = path.join(__dirname, 'conf', 'rewrite');

  rewrite.addFile(filePath);

  it('addFile()', function () {
    rules = rewrite.getRule();
    assert.equal(1, rules['hiproxy.org'].length);
    assert.equal(1, rules['www.hiproxy.org'].length);
  });

  it('deleteFile()', function () {
    rewrite.deleteFile(filePath);
    rules = rewrite.getRule();

    assert.equal(undefined, rules['hiproxy.org']);
    assert.equal(undefined, rules['www.hiproxy.org']);
  });

  it('disableFile()', function () {
    rewrite.addFile(filePath);

    rules = rewrite.getRule();

    assert.equal(1, rules['hiproxy.org'].length);
    assert.equal(1, rules['www.hiproxy.org'].length);

    rewrite.disableFile(filePath);
    rules = rewrite.getRule();

    assert.equal(undefined, rules['hiproxy.org']);
    assert.equal(undefined, rules['www.hiproxy.org']);
  });

  it('enableFile()', function () {
    rewrite.enableFile(filePath);
    rules = rewrite.getRule();

    assert.equal(1, rules['hiproxy.org'].length);
    assert.equal(1, rules['www.hiproxy.org'].length);
  });

  it('addRule()', function () {
    var rewrite = new Rewrite();
    rewrite.addRule('hiproxy.org => { location / { echo "test"; } }', 'snippet-1');
    rewrite.addRule('en.hiproxy.org, zh.hiproxy.org => { location / { echo "documentation"; } }', 'snippet-2');

    var rules = rewrite.getRule();

    assert.equal(1, rules['hiproxy.org'].length);
    assert.equal(1, rules['en.hiproxy.org'].length);
    assert.equal(1, rules['zh.hiproxy.org'].length);
  });

  it('clearRules()', function () {
    var rewrite = new Rewrite();
    rewrite.addRule('hiproxy.org => { location / { echo "test"; } }', 'snippet-1');
    rewrite.addRule('en.hiproxy.org, zh.hiproxy.org => { location / { echo "documentation"; } }', 'snippet-2');

    // rules = rewrite.getRule();

    // assert.equal(1, rules['hiproxy.org'].length);
    // assert.equal(1, rules['en.hiproxy.org'].length);
    // assert.equal(1, rules['zh.hiproxy.org'].length);

    rewrite.clearRules();
    rules = rewrite.getRule();

    assert.equal(undefined, rules['hiproxy.org']);
    assert.equal(undefined, rules['zh.hiproxy.org']);
    assert.equal(undefined, rules['en.hiproxy.org']);
  });

  it('clearFiles()', function () {
    var rewrite = new Rewrite();
    var rules = null;
    var filePath = path.join(__dirname, 'conf', 'rewrite');

    rewrite.addFile(filePath);

    rules = rewrite.getRule();
    assert.equal(1, rules['www.hiproxy.org'].length);

    rewrite.clearFiles();
    rules = rewrite.getRule();
    assert.equal(undefined, rules['www.hiproxy.org']);
  });

  it('getRule()', function () {
    var rewrite = new Rewrite();
    var filePath = path.join(__dirname, 'conf', 'rewrite');

    rewrite.addFile(filePath);

    var rules = rewrite.getRule();
    var rule1 = rewrite.getRule('hiproxy.org');
    var rule2 = rewrite.getRule('www.hiproxy.org');

    assert.equal(1, rules['hiproxy.org'].length);
    assert.equal(1, rules['www.hiproxy.org'].length);

    assert.deepEqual(['hiproxy.org'], rule1[0].domain);
    assert.deepEqual(['www.hiproxy.org'], rule2[0].domain);
  });
});

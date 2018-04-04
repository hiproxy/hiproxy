var assert = require('assert');
var path = require('path');
var Rewrite = require('../../src/rewrite');
var Logger = require('../../src/logger');
require('colors');

global.args = {};
global.log = new Logger();

describe('#rewrite - File name', function () {
  var filePath = path.join(__dirname, 'conf', 'rewrite');

  it('Real file name', function () {
    var rewrite = new Rewrite();
    rewrite.addFile(filePath);

    assert.equal(true, filePath in rewrite._files);
    assert.notEqual(undefined, rewrite._files[filePath].result['www.hiproxy.org']);
  });

  it('File name by user', function () {
    var rewrite = new Rewrite();

    rewrite.addRule('hiproxy.org => { location / { echo "test"; } }', 'snippet-1');

    assert.equal(true, 'snippet-1' in rewrite._files);
    assert.notEqual(undefined, rewrite._files['snippet-1'].result['hiproxy.org']);
  });

  it('Random file name', function () {
    var rewrite = new Rewrite();

    rewrite.addRule('hiproxy.org => { location / { echo "test"; } }');

    var files = Object.keys(rewrite._files);

    assert.equal(1, files.length);
    assert.notEqual(undefined, rewrite._files[files[0]].result['hiproxy.org']);
  });

  it('Update rules by set the `source` value', function () {
    var rewrite = new Rewrite();

    rewrite.addRule('hiproxy.org => { location / { echo "test"; } }', 'my-test-file');

    var fileInfo = rewrite._files['my-test-file'];

    assert.notEqual(undefined, fileInfo.result['hiproxy.org']);

    fileInfo.source = 'www.hiproxy.org => { location / { echo "test"; } }';

    assert.equal(undefined, fileInfo.result['hiproxy.org']);
    assert.notEqual(undefined, fileInfo.result['www.hiproxy.org']);
  });
});

var assert = require('assert');
var path = require('path');
var Rewrite = require('../../src/rewrite/');

var Logger = require('../../src/helpers/logger');
require('colors');

global.args = {};
global.log = new Logger();

describe('rewrite', function () {
  describe('api', function () {
    var rewrite = new Rewrite();
    var rule = null;
    var filePath = path.join(__dirname, 'rewrite');

    rewrite.addFile(filePath);

    it('disableFile()', function () {
      rule = rewrite.getRule('blog.hiproxy.org');
      assert.equal(true, rule.length > 0);

      rewrite.disableFile(filePath);
      rule = rewrite.getRule('blog.hiproxy.org');
      assert.equal(undefined, rule);
    });
    it('enableFile()', function () {
      rewrite.enableFile(filePath);
      rule = rewrite.getRule('blog.hiproxy.org');
      assert.equal(true, rule.length > 0);
    });
  });
});

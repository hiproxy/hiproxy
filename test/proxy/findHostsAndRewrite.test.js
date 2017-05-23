var assert = require('assert');
var path = require('path');

var findHostsAndRewrite = require('../../src/tools/findHostsAndRewrite');

describe('#findHostsAndRewrite', function () {
  it('should has error when dir is not right', function (done) {
    findHostsAndRewrite(path.join(__dirname, 'test'), function (err, hosts, rewrites) {
      if (err) {
        done();
      } else {
        done(Error('should has error'));
      }
    });
  });

  it('should find `hosts` file and `rewrite` file', function (done) {
    findHostsAndRewrite(__dirname, function (err, hosts, rewrites) {
      if (err) {
        done(err);
      }

      assert.equal(0, hosts.indexOf(path.join(__dirname, 'conf', 'hosts')));
      assert.equal(0, rewrites.indexOf(path.join(__dirname, 'conf', 'rewrite')));

      done();
    });
  });
});

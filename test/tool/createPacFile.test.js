var assert = require('assert');
var path = require('path');
var fs = require('fs');
var homedir = require('os-homedir');

var createPacFile = require('../../src/helpers/createPacFile');

describe('#replaceVar', function () {
  var pacFilePath = path.resolve(homedir(), '.hiproxy', 'proxy.pac');

  // TODO 放到beforetest里面
  before(function () {
    try {
      fs.mkdirSync(path.resolve(homedir(), '.hiproxy'));
    } catch (err) {
      if (err.code !== 'EEXIST') {
        console.error('.hiproxy create fail:', err);
      }
    }
  });

  describe('create pac file success', function () {
    it('should return filePath when create pac file successfuly', function (done) {
      createPacFile(5525, '127.0.0.1', {
        'www.example.com': 1,
        'blog.example.com': 1
      }).then(function (filePath) {
        var content = fs.readFileSync(pacFilePath, 'utf-8');

        assert.equal(filePath, pacFilePath);
        assert.notEqual(content.indexOf('"www.example.com": 1'), -1);
        assert.notEqual(content.indexOf('"blog.example.com": 1'), -1);

        done();
      }).catch(function (err) {
        done(err);
      });
    });
  });

  describe('create pac file fail', function () {
    var writeFile = null;

    before(function () {
      writeFile = fs.writeFile;
      fs.writeFile = function (filename, content, callback) {
        callback(new Error('file create fail'));
      };
    });

    it('should reject when create pac file fail', function (done) {
      createPacFile(5525, '127.0.0.1', {
        'www.example.com': 1,
        'blog.example.com': 1
      }).then(function (filePath) {
        done(Error('should reject when create pac file fail'));
      }).catch(function (err) {
        assert.notEqual(err, null);
        done();
      });
    });

    after(function () {
      fs.writeFile = writeFile;
    });
  });
});

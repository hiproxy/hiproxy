/**
 * @file pre test script
 * @author zdying
 */

var os = require('os');
var fs = require('fs');
var path = require('path');
var tmpdir = os.tmpdir();

console.log('================= before test =================');
console.log('clear `.hiproxy` direcotry ...');

var rmdir = function (dir) {
  var list = fs.readdirSync(dir);
  for (var i = 0; i < list.length; i++) {
    var filename = path.join(dir, list[i]);
    var stat = fs.statSync(filename);

    if (filename === '.' || filename === '..') {
      // pass these files
    } else if (stat.isDirectory()) {
      // rmdir recursively
      rmdir(filename);
    } else {
      // rm fiilename
      fs.unlinkSync(filename);
    }
  }
  fs.rmdirSync(dir);
};

try {
  rmdir(path.join(tmpdir, '.hiproxy'));
} catch (e) {
  // ...
}

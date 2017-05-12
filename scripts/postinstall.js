/**
 * @file
 * @author zdying
 */

var fs = require('fs');
var os = require('os');
var path = require('path');

var homedir = os.homedir();
var logDir = path.join(homedir, '.hiproxy', 'logs');
console.log(logDir);
mkdirp(logDir);

function mkdirp (dir) {
  if (fs.existsSync(dir)){
    return;
  }

  try{
    fs.mkdirSync(dir);
  }catch(err){
    if(err.code == 'ENOENT'){
      mkdirp(path.dirname(dir));
      mkdirp(dir);
    }
  }
}

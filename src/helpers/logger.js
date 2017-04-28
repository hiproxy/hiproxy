/**
 * @file 控制台日志
 * @author zdying
 */

var EventEmitter = require('events');

function Logger (stdout, stderr) {
  this.stdout = stdout;
  this.stderr = stderr;

  EventEmitter.call(this);
}

Logger.prototype = {
  constructor: Logger,

  __proto__: EventEmitter.prototype
};

// TODO access/debug/detail 需要优化，单独处理
'access debug detail log info warn error'.split(' ').forEach(function (level) {
  Logger.prototype[level] = function () {
    var stdout = level === 'error' ? this.stderr : this.stdout;
    var msg = [].slice.call(arguments, 0).join(' ');

    if (stdout && stdout.write) {
      stdout.write(msg);
    }

    this.emit('data', level, msg);
  };
});

module.exports = Logger;

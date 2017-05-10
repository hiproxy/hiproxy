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

  __proto__: EventEmitter.prototype,

  _printLog: function (level, msg) {
    var stdout = level === 'error' ? this.stderr : this.stdout;

    if (args.logTime) {
      msg = '[' + new Date().toLocaleTimeString() + '] ' + msg;
    }

    if (stdout && stdout.write) {
      stdout.write(msg);
    }

    this.emit('data', level, msg);
  }
};

'log info warn error debug detail'.split(' ').forEach(function (level) {
  Logger.prototype[level] = function () {
    var msg = [].slice.call(arguments, 0).join(' ');

    this._printLog(level, msg);
  };
});

Logger.prototype.access = function (req, proxy) {
  var statusCode = req.res.statusCode;
  var colormap = {
    404: 'yellow',
    500: 'red',
    304: 'green',
    200: 'white'
  };
  var time = Date.now() - req._startTime;
  var msg = [
    req.method.white,
    (req.originalUrl || req.url).gray,
    proxy ? ('==> '.bold.white + proxy.gray) : '',
    String(statusCode)[colormap[statusCode] || 'gray'],
    ('(' + time + 'ms' + ')')[time >= 2000 ? 'yellow' : 'gray']
  ].join(' ');

  this._printLog('access', msg);
};

module.exports = Logger;

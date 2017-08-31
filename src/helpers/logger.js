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

    /* istanbul ignore if */
    if (global.args && args.logTime) {
      msg = '[' + new Date().toLocaleTimeString() + '] ' + msg;
    }

    /* istanbul ignore if */
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
  var statusAndTime = String(statusCode)[colormap[statusCode] || 'gray'] + ' ' +
    ('(' + time + 'ms' + ')')[time >= 2000 ? 'yellow' : 'gray'];

  if (proxy) {
    this._printLog('proxy', ['┏'.blue, req.method.white, (req.originalUrl || req.url)].join(' '));
    this._printLog('proxy', ['┗'.blue, req.method.white, proxy, statusAndTime].join(' '));
  } else {
    this._printLog('access', [req.method.white, (req.originalUrl || req.url), statusAndTime].join(' '));
  }
};

module.exports = Logger;

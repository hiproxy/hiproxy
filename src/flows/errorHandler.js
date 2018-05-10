/**
 * @file Initialize work flow error handler
 * @author zdying
 */

var fs = require('fs');
var path = require('path');
var dirTool = require('../helpers/dirTool');

/* istanbul ignore next */
module.exports = function (err, ctx) {
  var server = this;
  var options = server.options;
  var onError = options.onError;
  var errDetail = getErrorDetail(err);
  var tmpDir = dirTool.getTmpDir();
  var fileName = (new Date()).toISOString() + '_' + Math.ceil(Math.random() * 1000) + '.log';
  var filePath = path.join(tmpDir, fileName.replace(/[:-]/g, '_'));
  var res = ctx.res;

  if (onError.length > 0) {
    onError.forEach(function (fn) {
      fn.call(server, err, ctx);
    });
  }

  var messages = [
    'Error: ' + (err.message || '').red.underline,
    '',
    'If you need help, you may report this error at:',
    '     ' + 'https://github.com/hiproxy/hiproxy/issues/new'.cyan.underline
  ];

  fs.writeFile(filePath, errDetail, function (err) {
    if (!err) {
      messages.push(
        '',
        'Please include the following file with any support request:',
        '     ' + filePath.underline
      );
    } else {
      messages.push(
        '',
        'Please include the following detail with any support request:',
        '',
        errDetail
      );
    }

    console.log('\n****************** ' + 'hiproxy Error'.red + ' ******************\n');

    messages.forEach(function (msg) {
      console.log(msg);
    });

    console.log('');

    if (!res) {
      // only exit the process when it's initialize flow.
      // hiproxy has two work flow: initialize and proxy.
      // only the proxy flow's context has the `res` property.
      process.exit();
    }
  });
};

function getErrorDetail (err) {
  var msg = [];
  var pkg = require('../../package.json');

  msg.push('hiproxy ' + pkg.version);
  msg.push('argv: ' + process.argv.slice(2).join(' '));

  msg.push('error message: ' + err.message);
  msg.push('error stack: ' + err.stack);
  msg.push('');

  return msg.join('\n');
}

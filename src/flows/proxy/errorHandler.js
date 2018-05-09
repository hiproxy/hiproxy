/**
 * @file Initialize work flow error handler
 * @author zdying
 */

/* istanbul ignore next */
module.exports = function (err, ctx) {
  var server = this;
  var options = server.options;
  var onError = options.onError;

  if (onError.length > 0) {
    onError.forEach(function (fn) {
      fn.call(server, err, ctx);
    });
  }

  // TODO 优化这里的提示
  console.log();
  console.log('[Error] hiproxy proxy error'.bold.red);
  console.log('You can submit this error with the detail message below to us here: ' + 'https://github.com/hiproxy/hiproxy/issues/new'.cyan.underline);
  console.log();
  console.log('The detail message is:');
  console.log(err.stack);
  console.log();

  // process.exit();
};

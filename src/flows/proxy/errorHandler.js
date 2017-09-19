/**
 * @file Initialize work flow error handler
 * @author zdying
 */

/* istanbul ignore next */
module.exports = function (err) {
  console.log();
  console.log('[Error] hiproxy proxy error'.bold.red);
  console.log('You can submit this error with the detail message below to us here: ' + 'https://github.com/hiproxy/hiproxy/issues/new'.blue.underline);
  console.log();
  console.log('The detail message is:');
  console.log(err.stack);
  console.log();

  process.exit();
};

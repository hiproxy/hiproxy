/**
 * @file Initialize work flow error handler
 * @author zdying
 */

/* istanbul ignore next */
module.exports = function (err) {
  console.log('Initialize hiproxy error:', err);
  process.exit();
};

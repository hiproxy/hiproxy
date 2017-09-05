/**
 * @file Initialize work flow error handler
 * @author zdying
 */

module.exports = function (err) {
  console.log('Initialize hiproxy error:', err);
  process.exit();
};

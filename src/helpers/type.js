/**
 * @file
 * @author zdying
 */
module.exports = function type (obj) {
  return ({}).toString.call(obj)
    .replace(/\[object (\w+)\]/, '$1')
    .toLowerCase();
};

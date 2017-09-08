/**
 * 打印`HI`图标和其他信息
 *
 * @param {Array} lines 要现实的信息数组
 */

module.exports = function showImage (lines) {
  lines = lines || [];
  console.log('  _     ' + '_'.bold.red + ' ', lines[0] || '');
  console.log(' | |   ' + '(_)'.bold.red, lines[1] || '');
  console.log(' | |__  ' + '_ '.blue, lines[2] || '');
  console.log(' | \'_ \\' + '| |'.blue, lines[3] || '');
  console.log(' | | | ' + '| |'.blue, lines[4] || '');
  console.log(' |_| |_' + '|_|'.blue, lines[5] || '');
  console.log('');
};

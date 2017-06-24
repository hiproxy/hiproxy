/**
 * @file find file by file name pattern
 * @author zdying
 */

'use strict';

var fs = require('fs');
var path = require('path');

/**
 * 通过文件路径模式查找文件
 * 语法支持的通配符：`*`, `?`, `[abc]`, `[a-z]`, `[^a-z]`, `[!a-z]`
 * 不支持：`**`
 * https://en.wikipedia.org/wiki/Glob_(programming)
 *
 * @param {Array|String} patterns 要匹配的模式
 * @param {Boolean} [ignoreCase=false] 是否忽略大小写，默认区分大小写
 * @returns {Array} 满足条件的文件列表
 */
module.exports = function (patterns, ignoreCase) {
  var result = [];
  if (!Array.isArray(patterns)) {
    result = glob(patterns, ignoreCase);
  } else {
    result = [].concat.apply([], patterns.map(function (pattern) {
      return glob(pattern, ignoreCase);
    }));
  }

  var uniqueResult = [];

  result.forEach(function (res) {
    if (uniqueResult.indexOf(res) === -1) {
      uniqueResult.push(res);
    }
  });

  return uniqueResult;
};

function glob (pattern, ignoreCase) {
  if (pattern.charAt(pattern.length - 1) === '/') {
    throw Error('File pattern should not be directory.');
  }

  pattern = path.resolve(pattern);

  pattern = pattern
    // 里面的`.(){}`一定是`.(){}`这些字符
    .replace(/([.(){}])/g, '\\$1')
    // * ==> 一个或者多个字符
    .replace(/\*/g, '.+')
    // ? ==> 一个字符
    .replace(/\?/g, '.')
    // [!xyz] ==> [^xyz]，`!`等价于`^`
    .replace(/\[!([^\]]+)\]/, '[^$1]');

  var dirname = pattern;
  var basename = '';
  // 第一个存在的目录
  var start = '';
  // start后面的剩下的basename数组
  var basenames = [];

  // 首先找到第一个实际存在的目录，以`/Users/zdying/github/*/*.md`为例：
  // 第一个存在的目录为:     `/Users/zdying/github/`
  // 剩下的basename数组为:  `['.+', '.+.md']`(已经转换成正则表达式了，原内容为`['*', '*.md']`)
  //
  // 然后在第一个存在的目录里面开始文件查找，查找到的文件根据层级，跟basenames对比，比如：
  // `/Users/zdying/github/`下存在：`docs`/`guides`/`LICENSE.md`，前两个为目录，后一个为文件。
  // 首先把目录`docs`跟`.+`比较，看是否匹配，如果匹配继续遍历。假设`docs`下存在`get_start.md`，
  // 然后将`get_start.md`跟`.+.md`比较，如果匹配，那么`get_start.md`为满足条件的文件。
  // +---------------------------------------------+
  // | /Users/zdying/github/    *   /   *.md       |
  // +--------------------------+--------+---------+
  //                            |        |
  // +--------------------------v--------v---------+
  // | /Users/zdying/github/  docs  / get_start.md |
  // +---------------------------------------------+

  while (true) {
    basename = path.basename(dirname);
    dirname = path.dirname(dirname);

    basenames.unshift(basename);

    if (dirname === '/') {
      break;
    }

    if (fs.existsSync(dirname)) {
      start = dirname;
      break;
    }
  }

  function walk (startDir, deep) {
    var files = fs.readdirSync(startDir);
    var matched = [];

    files.forEach(function (file) {
      var currPath = path.join(startDir, file);
      var state = fs.statSync(currPath);
      // 是否是文件模式（最后一个basename）
      var isFilePattern = deep === basenames.length - 1;
      var reg = new RegExp('^' + basenames[deep] + '$', ignoreCase ? 'i' : '');

      if (!isFilePattern && state.isDirectory() && reg.test(file)) {
        // 当前`文件`是目录，并且不是文件模式，并且匹配当前的basename，继续遍历目录
        matched = matched.concat(walk(currPath, deep + 1));
      } else if (isFilePattern && state.isFile() && reg.test(file)) {
        // 当前`文件`是文件，并且是文件模式，并且匹配当前的basename，放到结果中
        matched.push(currPath);
      }
    });

    return matched;
  }

  var result = walk(start, 0);

  // console.log({
  //   start: start,
  //   basenames: basenames,
  //   result: result
  // });

  return result;
}

// console.log(module.exports('/Users/zdy/github/hiproxy/*/*.Md', true));
// console.log(module.exports('/Users/zdy/github/hiproxy/*/[^_0-9]+.md'));
// console.log(module.exports('/Users/zdy/github/hiproxy/*/[!_0-9]+.md'));

// console.log(module.exports('./*/*.Md', true));
// console.log(module.exports('./*/[^_0-9]+.md'));
// console.log(module.exports('../hiproxy/*/[!_0-9]+.md'));

// console.log(module.exports('./doc/[_a-z]+.md'));
// console.log(module.exports(['./*/*.md', './.*']));
// console.log(module.exports(['./README.md', './*.md', './test/testServer.js', './doc/*.js', './.*']));

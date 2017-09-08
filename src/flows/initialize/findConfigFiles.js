/**
 * @file
 * @author zdying
 */
'use strict';

var glob = require('../../helpers/glob');

module.exports = function (ctx, next) {
  var config = ctx.args;
  var logger = ctx.log;
  var hostsPattern = config.hostsFile;
  var rewritePattern = config.rewriteFile;
  var dir = this.dir || process.cwd();

  if (hostsPattern == null) {
    hostsPattern = ['./*/hosts'];
  }

  if (rewritePattern == null) {
    rewritePattern = ['./*/rewrite'];
  }

  var hostsFiles = glob(hostsPattern, dir);
  var rewriteFiles = glob(rewritePattern, dir);

  logger.debug('add hosts [', hostsFiles.join(', ').bold.green, ']');
  logger.debug('add rewrites [', (rewriteFiles.join(', ')).bold.green, ']');

  // 将找到的Hosts文件解析并加入缓存
  this.addHostsFile(hostsFiles);

  // 将找到的rewrite文件解析并加入缓存
  this.addRewriteFile(rewriteFiles);

  next();
};

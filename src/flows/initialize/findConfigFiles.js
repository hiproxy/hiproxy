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
  var dir = this.dir;

  // TODO 添加对应的option到CLI中
  if (String(config.autoFindConf) !== 'false') {
    if (hostsPattern == null) {
      hostsPattern = ['./*/hosts', './hosts'];
    }

    if (rewritePattern == null) {
      rewritePattern = ['./*/rewrite', './rewrite'];
    }

    var hostsFiles = glob(hostsPattern, dir);
    var rewriteFiles = glob(rewritePattern, dir);

    logger.debug('add hosts [', hostsFiles.join(', ').bold.green, ']');
    logger.debug('add rewrites [', (rewriteFiles.join(', ')).bold.green, ']');

    // 将找到的Hosts文件解析并加入缓存
    this.addHostsFile(hostsFiles);

    // 将找到的rewrite文件解析并加入缓存
    this.addRewriteFile(rewriteFiles);

    // 添加内置的rewrite规则
    this.rewrite.addRule([
      'domain hi.proxy {',
      '  location / {',
      '    proxy_pass http://127.0.0.1:' + (args.port || 5525) + '/;',
      '  }',
      '}'
    ].join('\n'), 'hiproxy-internal-rewrite');
  }

  next();
};

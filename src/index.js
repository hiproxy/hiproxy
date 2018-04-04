/**
 * @file hiproxy全局实例（注意：不是hiproxy server实例）
 * @author zdying
 */
'use strict';

var hiproxy = {
  commands: require('./commands'),
  directives: require('./directives'),
  plugin: require('./plugin'),
  router: require('./routers'),
  dataProvider: require('./dataProvider'),
  glob: require('./helpers/glob'),
  Hemsl: require('hemsl'),
  Hosts: require('./hosts'),
  Rewrite: require('./rewrite'),
  Server: require('./server')
};

global.hiproxy = hiproxy;

module.exports = hiproxy;

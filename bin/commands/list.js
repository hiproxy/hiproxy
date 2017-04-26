/**
 * @file command `list`
 * @author zdying
 */

'use strict';

module.exports = {
  command: 'list',
  describe: 'Show all local http servers (In development)',
  usage: 'list [option]',
  fn: function () {
    console.log();
    console.log('Current http services:');
    console.log();
    console.log('  +---------------+--------+-------------------------+---------+');
    console.log('  | Service Name  |  Port  |          Address        |  State  |');
    console.log('  +---------------+--------+-------------------------+---------+');
    console.log('  | Proxy Server  | 10010  | http://127.0.0.1:10010/ | Running |');
    console.log('  | Https Server  | 443    | https://127.0.0.1/      | Stopped |');
    console.log('  | Static Server | 80     | http://127.0.0.1/       | Stopped |');
    console.log('  +---------------+--------+-------------------------+---------+');
    console.log();
  },
  options: {
    'type': {
      default: 'service',
      alias: 'S'
    }
  }
};

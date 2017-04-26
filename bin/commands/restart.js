/**
 * @file command `reload`
 * @author zdying
 */

'use strict';

module.exports = {
  command: 'reload',
  describe: 'Restart the local proxy server (In development)',
  usage: 'reload [option]',
  fn: function () {
    console.log();
    console.log('Server reloaded');
    console.log();
  }
};

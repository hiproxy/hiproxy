/**
 * @file Initialize hiproxy env
 * @author zdying
 */

'use strict';

module.exports = function createServer (ctx, next) {
  ctx.log = global.log = this.logger;

  // process
  // .on('unhandledRejection', (reason, p) => {
  //   console.error(reason, 'Unhandled Rejection at Promise', p);
  // })
  // .on('uncaughtException', err => {
  //   console.error(err, 'Uncaught Exception thrown');
  // });

  next();
};

/**
 * @file Initialize work flow
 * @author zdying
 */

var Flow = require('step-flow');
var initFlow = new Flow();

var initEnv = require('./initEnv');
var initServer = require('./initServer');
var findConfigFiles = require('./findConfigFiles');
var initEvent = require('./initEvent');
var errorHandler = require('./errorHandler');

initFlow
  .use('InitEnv', initEnv)
  .use('InitServer', initServer)
  .use('FindConfigFiles', findConfigFiles)
  .use('InitEvent', initEvent)
  // .use('debug', function (ctx, next) {
  //   // console.log(ctx);
  // })
  .catch(errorHandler);

module.exports = initFlow;

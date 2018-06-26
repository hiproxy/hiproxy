/**
 * @file hiproxy proxy work flow
 * @author zdying
 */
'use strict';

var Flow = require('step-flow');

var proxyFlow = new Flow();

var systemRoter = require('./systemRouter');
var hookReqAndRes = require('./hookReqAndRes');
var getProxyInfo = require('./getProxyInfo');
var doRequest = require('./doRequest');
var printLog = require('./printLog');
var errorHandler = require('../errorHandler');

proxyFlow
  .use('SystemRouter', systemRoter)
  .use('HookReqAndRes', hookReqAndRes)
  .use('GetProxyInfo', getProxyInfo)
  .use('DoRequest', doRequest)
  .use('Log', printLog)
  .catch(errorHandler);

module.exports = proxyFlow;

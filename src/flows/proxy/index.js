/**
 * @file hiproxy proxy work flow
 * @author zdying
 */
'use strict';

var Flow = require('step-flow');

var proxyFlow = new Flow();

var systemRoter = require('./systemRoter');
var getProxyInfo = require('./getProxyInfo');
var setReqOption = require('./setReqOption');
var doRequest = require('./doRequest');
var printLog = require('./printLog');
var errorHandler = require('./errorHandler');

proxyFlow
  .use('SystemRouter', systemRoter)
  .use('GetProxyInfo', getProxyInfo)
  .use('SetRequestHeader', setReqOption)
  .use('DoRequest', doRequest)
  .use('Log', printLog)
  .catch(errorHandler);

module.exports = proxyFlow;

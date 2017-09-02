/**
 * @file hiproxy work flow
 * @author zdying
 */

var Flow = require('step-flow');
var server = require('./steps/create_server/createServer');

var initFlow = new Flow();
var workFlow = new Flow();

/* ******************** INIT flow ******************** */
initFlow
  .use('Create Server', createServer)
  .use('Initialize Event', initEvent)
  .catch(function (err) {
    console.log('init error:', err);
    process.exit();
  });

function createServer (ctx, next) {
  var args = ctx.args;
  server.create(args.port || 5525).then(function (server) {
    ctx.httpServer = server;
    next();
  }).catch(function (err) {
    next(err);
  });
}

function initEvent (ctx, next) {
  ctx.httpServer.on('request', function (req, res) {
    workFlow.run({
      req: req,
      res: res
    });
  });
  console.log('Event initialized.');
}
/* ******************** INIT flow ******************** */

/* ******************** WORK flow ******************** */
workFlow
  .use('Get Proxy Info', getProxyInfo)
  .use('Set Request Option', setReqOption)
  .use('Request', doRequest)
  .use('Response', doResponse)
  .catch(function (err) {
    console.log('error:', err);
    process.exit();
  });

function getProxyInfo (ctx, next) {
  ctx.proxyInfo = {
    url: ctx.req.url,
    method: ctx.req.method,
    proxy: 'hiproxy'
  };

  next();
}

function setReqOption (ctx, next) {
  ctx.reqOption = {
    todo: 'todo'
  };

  next();
}

function doRequest (ctx, next) {
  ctx.reqContent = Math.random();
  next();
}

function doResponse (ctx) {
  ctx.res.write('WorkFlow: ' + ctx.proxyInfo.method + ' ' + ctx.proxyInfo.url);
  ctx.res.write('\n');
  ctx.res.write('Content : ' + ctx.reqContent);
  ctx.res.end();
  console.log(ctx.proxyInfo.method + ' ' + ctx.proxyInfo.url);
}
/* ******************** WORK flow ******************** */

initFlow.run({
  args: {}
});

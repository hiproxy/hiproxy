var HiProxyServer = require('../src');
var proxy = new HiProxyServer(6789, 10086);

global.args = {
  proxyContentLog: true
};

// TODO 临时方案
global.log = proxy.logger;

// events
proxy.on('request', function (req, res) {
  req.someThing = 'some thing';
  console.log('new request =>'.bold.red, req.method, (req.client.encrypted ? 'https' : 'http').bold.green, req.url, req.headers);
});

proxy.on('httpsRequest', function (req, res) {
  req.someThing = 'some thing';
  console.log('new https request =>'.bold.red, req.method, req.url, req.headers);
});

proxy.on('connect', function (req) {
  console.log('new connect =>'.bold.red, req.method, req.url, req.headers);
});

proxy.on('data', function (data) {
  // console.log('on data =>', data.toString().length);
});

proxy.logger.on('data', function (level, msg) {
  console.log(('[' + level + '] ').bold.green + msg);
});

proxy.start().then(function (servers) {
  console.log('proxy server started at: 127.0.0.1:6789');
});

proxy.openBrowser('chrome', 'http://127.0.0.1:6789', false);

// stop proxy server
// proxy.stop();

// restart proxy server
// proxy.restart();

var HiProxyServer = require('../src');
var proxy = new HiProxyServer(6789, 10086);

global.args = {
  proxyContentLog: true
};

// events
proxy.on('request', function (req, res) {
  req.someThing = 'some thing';
  console.log('new request =>', req.method, req.url);
});

proxy.on('data', function (data) {
  console.log('on response =>', data.toString());
});

proxy.start().then(function (servers) {
  console.log('proxy server started at: 127.0.0.1:6789');
});

proxy.openBrowser('chrome', 'http://127.0.0.1:6789', false);

// stop proxy server
// proxy.stop();

// restart proxy server
// proxy.restart();

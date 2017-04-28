var HiProxyServer = require('../src');
var proxy = new HiProxyServer(8848, 10086);

// events
proxy.on('request', function (req, res) {
  req.someThing = 'some thing';
  console.log('new request =>', req.method, req.url);
});

proxy.on('data', function (data) {
  console.log('on response =>', data.toString());
});

proxy.start().then(function (servers) {
  console.log('proxy server started at: 127.0.0.1:8848');
});

proxy.openBrowser('chrome', 'http://127.0.0.1:8848', false);

// stop proxy server
// proxy.stop();

// restart proxy server
// proxy.restart();

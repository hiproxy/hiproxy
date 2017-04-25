# hiproxy

hiproxy is a lightweight Node.js proxy client with hosts and nginx-like config support.

[![Build Status](https://travis-ci.org/zdying/hiproxy.svg?branch=master)](https://travis-ci.org/zdying/hiproxy)
[![codecov](https://codecov.io/gh/zdying/hiproxy/branch/master/graph/badge.svg)](https://codecov.io/gh/zdying/hiproxy)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)
[![npm](https://img.shields.io/npm/v/hiproxy.svg)](https://www.npmjs.com/package/hiproxy)
[![Node.js version](https://img.shields.io/badge/node-%3E%3D0.12.7-orange.svg)](https://nodejs.org/)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/zdying/hiproxy/blob/master/LICENSE)

# Install

```bash
npm install -g hiproxy
```

# Usage

## CLI

1. Start proxy server
```bash
cd your_workspace
hiproxy start -p 5525 --debug
```

2. Config proxy

```bash
127.0.0.1:5525
```

## Node.js API

```js
var HiProxyServer = require('hiproxy');
var proxy = new HiProxyServer(8848, 10086);

proxy.on('start', function(data){
  console.log('server started.');
});

proxy.on('request', function(req, res){
  req.someThing = 'some thing';
  console.log('new request =>', req.method, req.url);
});

proxy.on('data', function(data){
  log.info('on response =>', data.toString());
})

proxy.start().then(function (servers) {
  console.log('proxy server started at: 127.0.0.1:8848');
});
```

# Documentation

* [Usage Guide](doc/guide.md)
* [API documentation](doc/api.md)
* [Rewrite Config Guide](doc/rewrite_config.md)
* [Hosts Config Guide](doc/hosts_config.md)


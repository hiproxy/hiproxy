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

// events
proxy.on('request', function(req, res){
  req.someThing = 'some thing';
  console.log('new request =>', req.method, req.url);
});

proxy.on('data', function(data){
  console.log('on response =>', data.toString());
});

proxy.start().then(function (servers) {
  console.log('proxy server started at: 127.0.0.1:8848');
});

// stop proxy server
// proxy.stop();

// restart proxy server
// proxy.restart();
```

# CLI commands and options

## Commands and global options

```
  Usage:

    hiproxy [command] [option]

  Commands:

    start  启动代理服务

  Options:

    -v, --version   显示版本信息
    -h, --help      显示帮助信息
    -d, --debug     显示调试信息
    -D, --detail    显示详细调试信息
    --log-time      显示日志时间
```

## Command help

### start

```
  USAGE:

    start [--port <port>] [-xodD]

  DESCRIBE:

    启动代理服务

  OPTIONS:

    -h, --help                    show help info
    -p, --port <port>             http代理服务端口号
    -s, --https                   启动https代理服务
    -m, --middle-man-port <port>  https中间人端口号
    -o, --open [browser]          打开浏览器窗口
    --pac-proxy                   是否使用自动代理，如果使用，不在hosts或者rewrite规则中的域名不会走代理
```

# Documentation

* [Usage Guide](https://github.com/zdying/hiproxy/blob/master/doc/guide.md)
* [API documentation](https://github.com/zdying/hiproxy/blob/master/doc/api.md)
* [Rewrite Config Guide](https://github.com/zdying/hiproxy/blob/master/doc/rewrite_config.md)
* [Hosts Config Guide](https://github.com/zdying/hiproxy/blob/master/doc/hosts_config.md)

# hosts config example

hiproxy supports enhanced version of `hosts`,
the `hosts` file supports not only IP but also port numbers.

```bash
# comment
127.0.0.1 example.com
127.0.0.1:8800 blog.example.com life.example.com
```

# rewrite config example

```bash
set $port 8899;
set $ip   127.0.0.1;
set $online 210.0.0.0;

domain example.com {
  location / {
    proxy_pass http://$online/;
  }

  location /blog/ {
    proxy_pass http://$ip:$port/blog/;

    proxy_set_header from 'hiproxy';

    set_header proxy 'hiproxy';
  }
}
```

# Running example

```
cd example
node index.js
```

* url => http://test.com

# Running tests

```bash
npm test
```

# License

MIT


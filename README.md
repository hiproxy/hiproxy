# hiproxy

hiproxy is a lightweight Node.js proxy client with hosts and nginx-like config support.

[![Build Status](https://travis-ci.org/hiproxy/hiproxy.svg?branch=master)](https://travis-ci.org/hiproxy/hiproxy)
[![codecov](https://codecov.io/gh/hiproxy/hiproxy/branch/master/graph/badge.svg)](https://codecov.io/gh/hiproxy/hiproxy)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat)](https://github.com/Flet/semistandard)
[![npm](https://img.shields.io/npm/v/hiproxy.svg)](https://www.npmjs.com/package/hiproxy)
[![Node.js version](https://img.shields.io/badge/node-%3E%3D0.12.7-green.svg)](https://nodejs.org/)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/hiproxy/hiproxy/blob/master/LICENSE)

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

```bash
> hiproxy --help

Commands:

  start   Start a local proxy server
  stop    Stop the local proxy server
  reload  Restart the local proxy server (In development)
  state   Show all the servers state
  open    Open browser and set proxy

Options:

  -v, --version     显示版本信息
  -h, --help        显示帮助信息
  -D, --daemon      后台运行
  --log-dir         后台运行时日志存放路径（绝对路径），默认为用户目录
  --log-time        显示日志时间
  --log-level       过滤日志级别，只有指定级别的日志才会显示
  --grep <content>  过滤日志内容，只有保护过滤字符串的日志才会显示
```

# Documentation

* [Usage Guide](https://github.com/hiproxy/hiproxy/blob/master/doc/guide.md)
* [API documentation](https://github.com/hiproxy/hiproxy/blob/master/doc/api.md)
* [Rewrite Config Guide](https://github.com/hiproxy/hiproxy/blob/master/doc/rewrite_config.md)
* [Rewrite directives](https://github.com/hiproxy/hiproxy/blob/master/doc/rewrite_directives.md)
* [Hosts Config Guide](https://github.com/hiproxy/hiproxy/blob/master/doc/hosts_config.md)
* [Command Line Commands and Options](https://github.com/hiproxy/hiproxy/blob/master/doc/cli_options.md)

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

# Example

Here is an Example project [https://github.com/hiproxy/hiproxy-example](https://github.com/hiproxy/hiproxy-example)

# Running tests

```bash
npm test
```

# License

MIT


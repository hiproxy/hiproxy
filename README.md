# hiproxy

<img src="https://avatars0.githubusercontent.com/u/29273417?v=3" alt="hiproxy" width="120" height="120">


hiproxy is a lightweight web proxy tool based on Node.js. The main purpose is to solve the problem of *host management* and *reverse proxy* encountered by multiple developers during the development process. So that in the development, no longer need to modify the system hosts and start a Nginx service. Hiproxy extends the syntax of hosts to support port numbers. In addition, hiproxy also supports the configuration of proxies through a syntax similar to the nginx configuration file.

hiproxy是一个基于Node.js开发的轻量级网络代理工具，主要目的是为了解决多个开发者在开发过程中遇到的hosts管理和反向代理的问题。使得在开发时，不再需要修改系统hosts和启动一个Nginx服务。hiproxy扩展了hosts的语法，支持端口号。此外，hiproxy还支持通过类似于nginx配置文件的语法来配置代理。

[![Build Status](https://travis-ci.org/hiproxy/hiproxy.svg?branch=master)](https://travis-ci.org/hiproxy/hiproxy)
[![codecov](https://codecov.io/gh/hiproxy/hiproxy/branch/master/graph/badge.svg)](https://codecov.io/gh/hiproxy/hiproxy)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat)](https://github.com/Flet/semistandard)
[![npm](https://img.shields.io/npm/v/hiproxy.svg)](https://www.npmjs.com/package/hiproxy)
[![Node.js version](https://img.shields.io/badge/node-%3E%3D0.12.7-green.svg)](https://nodejs.org/)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/hiproxy/hiproxy/blob/master/LICENSE)

# Why Hiproxy

在前端开发中，如果我们通常会遇到下面的一些问题：

1. 调试线上页面的样式或者交互问题，如果要在本地进行开发，需要能运行后端的项目（Node.js或者Java等项目），如果后端项目环境比较复杂，前端工程师在本地搭建一套后端环境，可能代价比较大。
2. 如果有多个前端工程，采用一个域名，部分工程需要请求线上资源，部分工程请求本地。
3. 为解决跨域等问题，本地开发时需要修改Response Header。
4. 本地开发https站点时，证书不受信任。

我们会使用Nginx来解决上面的问题。Nginx很优秀，也是我们前端开发工程师的一个非常好的朋友。Nginx的配置文件风格，非常直观，编写配置效率很高。但是，使用Nginx的时候，我们同时需要使用hosts，把相关请求发送到本地的Nginx服务。而且，大部分情况下，Nginx的配置文件并不会被提交到代码仓库，所以团队中其他开发者之间会互相拷贝配置文件，这样效率比较地，而且一个人修改了，其他人的配置没有随之更新。对于多个域名的配置，也都是放到一个统一的目录，然后在主配置里面include，这样也不太方便。

于是有了hiproxy。

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
* [Plugin Guide](https://github.com/hiproxy/hiproxy/blob/master/doc/plugin_guide.md)
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


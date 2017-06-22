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

## Why Hiproxy

在前端开发中，如果我们通常会遇到下面的一些问题：

1. 调试线上页面问题，要在本地进行开发，需要能运行后端的项目（Node.js或者Java等项目），前端工程师在本地搭建一套后端环境，可能代价比较大。
2. 如果有多个前端工程，采用一个域名，部分工程需要请求线上资源，部分工程请求本地。
3. 为解决跨域等问题，本地开发时需要修改Response Header。
4. 本地开发https站点时，证书不受信任。
5. 系统hosts修改后，不会立即生效。

我们会使用Nginx来解决上面的问题。Nginx很优秀，也是我们前端开发工程师的一个非常好的朋友。Nginx的配置文件风格，非常直观，编写配置效率很高。

但是，使用Nginx的时候，我们同时需要使用hosts，把相关请求发送到本地的Nginx服务。

此外，大部分情况下，Nginx的配置文件并不会被提交到代码仓库，所以团队中其他开发者之间会互相拷贝配置文件，这样效率比较低，而且一个人修改了配置文件，其他人的配置不会随之更新。对于多个域名的配置，也都是放到一个统一的目录，然后在主配置里面include，这样也不太方便。

hosts、反向代理、https和缓存这些琐碎的事情，能不能统一解决？

于是有了hiproxy。

## Features

* 支持Nginx风格的配置文件格式，配置简单直观
* 支持hosts以及扩展（支持端口号）
* 支持插件扩展rewrite指令、CLI命令和页面
* 支持HTTPS证书自动生成
* 支持代理自动配置（Proxy auto-config）
* 支持后台启动，日志输出到文件
* 支持配置文件自动查找
* 支持打开浏览器窗口并自动配置代理
* 提供Node.js API
* ...

## Install

```bash
npm install -g hiproxy
```

## Usage

### CLI

1. Start proxy server
```bash
hiproxy start -p 5525 --debug --workspace <path-to-your-workspace>
```

2. Config proxy

```bash
127.0.0.1:5525
```

### Node.js API

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

## CLI commands and options

```bash
> hiproxy --help

Commands:

  start   Start a local proxy server
  stop    Stop the local proxy server
  restart  Restart the local proxy server
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

## Documentation

* [Usage Guide](https://github.com/hiproxy/hiproxy/blob/master/doc/guide.md)
* [API documentation](https://github.com/hiproxy/hiproxy/blob/master/doc/api.md)
* [Plugin Guide](https://github.com/hiproxy/hiproxy/blob/master/doc/plugin_guide.md)
* [Rewrite Config Guide](https://github.com/hiproxy/hiproxy/blob/master/doc/rewrite_config.md)
* [Rewrite directives](https://github.com/hiproxy/hiproxy/blob/master/doc/rewrite_directives.md)
* [Hosts Config Guide](https://github.com/hiproxy/hiproxy/blob/master/doc/hosts_config.md)
* [Command Line Commands and Options](https://github.com/hiproxy/hiproxy/blob/master/doc/cli_options.md)

## hosts config example

hiproxy supports enhanced version of `hosts`,
the `hosts` file supports not only IP but also port numbers.

```bash
# comment
127.0.0.1 example.com
127.0.0.1:8800 blog.example.com life.example.com
```

## rewrite config example

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

## Example

Here is an Example project [https://github.com/hiproxy/hiproxy-example](https://github.com/hiproxy/hiproxy-example)

## Running tests

```bash
npm test
```

## Contributing

Please read [CONTRIBUTING.md](https://github.com/hiproxy/hiproxy/blob/master/CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* __zdying__ - _HTML/JavaScript/CSS/Node.js developer_ [zdying](https://github.com/zdying)
* __Alfred Sang (aka i5ting)__ - _CTO of Aircos, top trainer of StuQ, author of the open source project Moa.js, and also an evangelist of Node.js._

See also the list of [contributors](https://github.com/hiproxy/hiproxy/graphs/contributors) who participated in this project.

## Built With

* [hemsl](https://www.npmjs.com/package/hemsl) - a lightweight Node.js command line argv parser and command executor.
* [colors](https://www.npmjs.com/package/colors) - get color and style in your node.js console.
* [node-forge](https://www.npmjs.com/package/node-forge) - JavaScript implementations of network transports, cryptography, ciphers, PKI, message digests, and various utilities.
* [op-browser](https://www.npmjs.com/package/op-browser) - Open browser window and set proxy.
* [os-homedir](https://www.npmjs.com/package/os-homedir) - Node.js 4 `os.homedir()` ponyfill.
* [url-pattern](https://www.npmjs.com/package/url-pattern) - easier than regex string matching patterns for urls and other strings. turn strings into data or data into strings.
* [simple-mime](https://www.npmjs.com/package/simple-mime) - A simple mime database.

Thanks to the authors of the above libraries to provide such a useful library.

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/hiproxy/hiproxy/blob/master/LICENSE) file for details


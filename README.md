# hiproxy

<img src="https://avatars0.githubusercontent.com/u/29273417?v=3" alt="hiproxy" width="120" height="120">

**hiproxy** is a lightweight web proxy tool based on [Node.js][node]. The primary purpose of **hiproxy** is to solve the problem of host management and reverse proxy needs of developers.

For example, if you are working as a team and each of the developers in the team need a different proxy setting, you will no longer need to modify your hosts file or use a web server like [Nginx][nginx] as a reverse proxy.

**hiproxy** extends the syntax of hosts file to support **port numbers**. Besides, hiproxy also supports configuration through a syntax similar to the [Nginx configuration file][nginx-config].

[nginx]: https://nginx.org/
[nginx-config]: http://nginx.org/en/docs/beginners_guide.html "nginx Beginner’s Guide"
[node]: https://nodejs.org "Node.js"

[中文版文档](https://github.com/hiproxy/hiproxy/blob/master/README-zh.md)

[![Build Status](https://travis-ci.org/hiproxy/hiproxy.svg?branch=master)](https://travis-ci.org/hiproxy/hiproxy)
[![codecov](https://codecov.io/gh/hiproxy/hiproxy/branch/master/graph/badge.svg)](https://codecov.io/gh/hiproxy/hiproxy)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat)](https://github.com/Flet/semistandard)
[![npm](https://img.shields.io/npm/v/hiproxy.svg)](https://www.npmjs.com/package/hiproxy)
[![Node.js version](https://img.shields.io/badge/node-%3E%3D0.12.7-green.svg)](https://nodejs.org/)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/hiproxy/hiproxy/blob/master/LICENSE)

## Why Hiproxy

In front-end development, if we usually encounter some of the following problems:

1. Debug online page problems, to be developed locally, you need to run back-end projects (Node.js or Java and other projects), front-end engineers to __build a set of back-end environment, may be very difficult__.
2. If there are multiple front-end projects, using __a common domain name__, some projects need to request online resources, part of the project request local.
3. To solve cross-domain and other issues, local development need to __modify the Response Header__.
4. When test https pages, __the self-signed certificate is not trusted__.
5. Because the exists of __DNS cache__. Change system hosts will not take effect immediately.
6. Also you like __Nginx config syntax__.

We will use Nginx to solve the above problem. Nginx is excellent and a very good friend of our front-end engineers. Nginx configuration file style, very intuitive, the preparation of high efficiency configuration.

However, when using Nginx, we also need to use hosts at the same time, and proxy the relevant request to the local Nginx service.

In addition, in most cases, Nginx's configuration files will not be submitted to the code repository, so the other developers in the team will copy the configuration file between each other, so that the efficiency is relatively low, and a person to modify the configuration file, other people's configuration file will not be updated. We put a number of domain name configuration file into one directory, and then included in the main configuration, it is not convenient.

We can have a better way to solve these problems like ___Hosts___, ___reverse proxy___, ___https___ and ___DNS cache___?

So with hiproxy.

## Features

* Support Nginx-config style configuration file syntax, simple and intuitive configuration
* Support extended hosts and (support port number)
* Supports plugin extensions to rewrite directives, CLI commands and pages
* Support for automatic generation and management of HTTPS certificates
* Support for proxy auto-configuration (Proxy auto-config)
* Support run service on background, and redirect console output to log file
* Support configuration file to automatically find
* Support to open the browser window and automatically configure the proxy
* Provide the Node.js API
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


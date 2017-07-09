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

## Why Hiproxy?

If you are a front-end developer, it is not uncommon for you to encounter the following problems:

**Debugging web pages locally**: To develop your web projects in a local development environment, you’ll have to run a back-end server (such as a **Node.js** *express* application, or a **Java SpringBoot** application). As a front-end developer, you might not be familiar with the back-end technology stack, simply setting up the development environment can consume a lot of your time.

**Cross-Origin Issues**: While developing your front-end projects locally, you might need to solve cross-domain and cross-origin resource sharing issues. To address these problems, you will need to modify the response header. 


**Self-Signed Certificates**: You’ll often need to test https pages. When you visit https pages with a self-signed certificate, your browser will raise security warnings.

One common way to modify the response header is to put a **proxy** as a “man in the middle”. *NGINX*, for example, has a nice syntax that you can configure as a reverse-proxy to handle all these needs.


Although NGINX is a great tool to address all the above problems, when setting up NGINX, you’ll also modify your hosts file a lot to proxy the requests to a local NGINX service. This can especially turn out to be a burden if you are working on multiple projects.

Can we have a better way to solve this problem?

Well, yes. Meet **hiproxy**!


## Features

* **Nginx.config-style configuration** file syntax with a simple and intuitive configuration
* **Extended** hosts configuration with **port numbers**.
* **Plugin extensions** to rewrite *directives*, *command line interface*, and *pages*
* Automatic generation and management of **TLS certificates**
* **Auto-detection** of configuration file
* **Proxy auto-configuration**
* You can run hiproxy as a **background service** and redirect its output to a log file.
* You can open a browser window and configure your proxy from its **web interface**.
* **hiproxy** provides a **Node.js API** for fine-tuning and lower-level control.

## Installation

```bash
npm install -g hiproxy
```

## Usage

### CLI

Start proxy server"

```bash
hiproxy start -p 5525 --debug --workspace ${PATH_TO_WORKSPACE}
```

Configure proxy:

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

## CLI Usage

```bash
> hiproxy --help

Commands:

  start   Start a local proxy server
  stop    Stop the local proxy server
  restart  Restart the local proxy server
  state   Show all the servers state
  open    Open browser and set proxy

Options:

  -v, --version
  -h, --help
  -D, --daemon
  --log-dir
  --log-time
  --log-level
  --grep <content>
```

## Documentation

* [User Guide](https://github.com/hiproxy/hiproxy/blob/master/doc/guide.md)
* [API Documentation](https://github.com/hiproxy/hiproxy/blob/master/doc/api.md)
* [Plugin Guide](https://github.com/hiproxy/hiproxy/blob/master/doc/plugin_guide.md)
* [Rewrite Config Guide](https://github.com/hiproxy/hiproxy/blob/master/doc/rewrite_config.md)
* [Rewrite Directives](https://github.com/hiproxy/hiproxy/blob/master/doc/rewrite_directives.md)
* [Hosts Config Guide](https://github.com/hiproxy/hiproxy/blob/master/doc/hosts_config.md)
* [Command Line Interface](https://github.com/hiproxy/hiproxy/blob/master/doc/cli_options.md)

### Hosts Configuration Example

**hiproxy** supports enhanced version of `hosts`, the `hosts` file supports not only IP but also **port numbers**.

```bash
# comment
127.0.0.1 example.com
127.0.0.1:8800 blog.example.com life.example.com
```

### Rewrite Configuration Example

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

## Sample Project

[Here is an example project that you can play with](https://github.com/hiproxy/hiproxy-example).

## Running Tests

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

## Code of Conduct

We are committed to making participation in this project a harassment-free experience for everyone, regardless of the level of experience, gender, gender identity and expression, sexual orientation, disability, personal appearance, body size, race, ethnicity, age, religion, or nationality.

[See the code of conduct for details](CODE_OF_CONDUCT.md).


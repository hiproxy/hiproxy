# hiproxy

<img src="https://avatars0.githubusercontent.com/u/29273417?v=3" alt="hiproxy" width="120" height="120">

hiproxy是一个基于Node.js开发的轻量级网络代理工具，主要目的是为了解决多个开发者在开发过程中遇到的hosts管理和反向代理的问题。使得在开发时，不再需要修改系统hosts和启动一个Nginx服务。hiproxy扩展了hosts的语法，支持端口号。此外，hiproxy还支持通过类似于nginx配置文件的语法来配置代理。

[![Build Status](https://travis-ci.org/hiproxy/hiproxy.svg?branch=master)](https://travis-ci.org/hiproxy/hiproxy)
[![codecov](https://codecov.io/gh/hiproxy/hiproxy/branch/master/graph/badge.svg)](https://codecov.io/gh/hiproxy/hiproxy)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat)](https://github.com/Flet/semistandard)
[![npm](https://img.shields.io/npm/v/hiproxy.svg)](https://www.npmjs.com/package/hiproxy)
[![Node.js version](https://img.shields.io/badge/node-%3E%3D0.12.7-green.svg)](https://nodejs.org/)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/hiproxy/hiproxy/blob/master/LICENSE)

## Why Hiproxy

在前端开发中，如果我们通常会遇到下面的一些问题：

1. 调试线上页面问题，要在本地进行开发，需要能运行后端的项目（Node.js或者Java等项目），__前端工程师在本地搭建一套后端环境，可能代价比较大__。
2. 如果有多个前端工程，__采用一个域名__，__部分工程__ 需要请求 __线上__ 资源，__部分__ 工程请求 __本地__。
3. 为解决跨域等问题，本地开发时需要 __修改Response Header__。
4. 本地开发https站点时，__证书不受信任__。
5. 系统 __hosts修改__ 后，__不会立即生效__。

我们会使用Nginx来解决上面的问题。Nginx很优秀，也是我们前端开发工程师的一个非常好的朋友。Nginx的配置文件风格，非常直观，编写配置效率很高。

但是，使用Nginx的时候，我们同时需要使用hosts，把相关请求发送到本地的Nginx服务。

此外，大部分情况下，Nginx的配置文件并不会被提交到代码仓库，所以团队中其他开发者之间会互相拷贝配置文件，这样效率比较低，而且一个人修改了配置文件，其他人的配置不会随之更新。对于多个域名的配置，也都是放到一个统一的目录，然后在主配置里面include，这样也不太方便。

__hosts__、__反向代理__、__https__ 和 __缓存__ 这些琐碎的事情，能不能统一解决？

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

1. 启动服务
```bash
hiproxy start -p 5525 --debug --workspace <path-to-your-workspace>
```

2. 配置浏览器代理

```bash
127.0.0.1:5525
```

__注意__: 也可在启动的时候，添加选项`--open [browser]`，这样hiproxy会自动打开一个浏览器窗口，并设置好代理。

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

## CLI命令和选项

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

## 文档

## Documentation

> **提示**: 文档正在编写中，如果你愿意帮忙编写或者翻译文档，请联系[zdying@live.com](mailto:zdying@live.com)
 
## Documentation

* <http://hiproxy.org/> 

> **Note**: This is an incomplete documentation, we are still writing, 
> if you are willing to help us write or translate the documentation, please contact [zdying@live.com](mailto:zdying@live.com)

### Steps for Contributing Documentation

* 文档地址 : <https://github.com/hiproxy/documentation>

* 从这些[issues](https://github.com/hiproxy/hiproxy/issues?utf8=%E2%9C%93&q=is%3Aissue%20is%3Aopen%20%5BTranslate%5D)中选择一个你准备翻译的Issue，告诉其他人你准备翻译这部分.

* [fork](https://github.com/hiproxy/documentation/fork)项目.

* 你可以直接替换掉对应目录中的内容成英文版本.

* 提交 PR.

 
## Wiki

* <https://github.com/hiproxy/hiproxy/wiki>

## hosts配置示例

hiproxy支持扩展的`hosts`，支持端口号，例如：

```bash
# comment
127.0.0.1 example.com
127.0.0.1:8800 blog.example.com life.example.com
```

## rewrite配置示例

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

## 示例

Here is an Example project [https://github.com/hiproxy/hiproxy-example](https://github.com/hiproxy/hiproxy-example)

## 运行测试

```bash
npm test
```

## 贡献代码

请参阅[CONTRIBUTING.md](https://github.com/hiproxy/hiproxy/blob/master/CONTRIBUTING.md)了解我们的行为准则以及如何为`hiproxy`贡献代码。

## 作者

* __zdying__ - _HTML/JavaScript/CSS/Node.js 开发者_ [zdying](https://github.com/zdying)
* __zhouhailong__ - _HTML/JavaScript/CSS/Node.js 开发者_ [zhouhailong](https://github.com/zhouhailong)
* __Alfred Sang (aka i5ting)__ - _Aircos CTO, StuQ 明星讲师, 开源项目Moa.js的作者, 同时也是Node.js的布道者_

您也可以点击[contributors](https://github.com/hiproxy/hiproxy/graphs/contributors)查看其他贡献者。

## 感谢

* [v0lkan](https://github.com/v0lkan)
* [JayLee404](https://github.com/JayLee404)
* [Jeoxs](https://github.com/Jeoxs)

## 升级日志

详情请查看[CHANGELOG.md](./CHANGELOG.md)。

## 依赖的第三方库

* [hemsl](https://www.npmjs.com/package/hemsl) - a lightweight Node.js command line argv parser and command executor.
* [colors](https://www.npmjs.com/package/colors) - get color and style in your node.js console.
* [node-forge](https://www.npmjs.com/package/node-forge) - JavaScript implementations of network transports, cryptography, ciphers, PKI, message digests, and various utilities.
* [op-browser](https://www.npmjs.com/package/op-browser) - Open browser window and set proxy.
* [os-homedir](https://www.npmjs.com/package/os-homedir) - Node.js 4 `os.homedir()` ponyfill.
* [url-pattern](https://www.npmjs.com/package/url-pattern) - easier than regex string matching patterns for urls and other strings. turn strings into data or data into strings.
* [simple-mime](https://www.npmjs.com/package/simple-mime) - A simple mime database.

感谢以上开源库的作者，提供了这些优秀的库。

## License

这个项目采用MIT协议，点击[LICENSE](https://github.com/hiproxy/hiproxy/blob/master/LICENSE)查看详细信息。


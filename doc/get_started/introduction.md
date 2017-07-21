# Introduction

> 如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！
>
> If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

hiproxy是一个基于Node.js开发的轻量、可扩展的网络代理工具，主要目的是为了解决多个开发者在开发过程中遇到的hosts管理和请求代理的问题。使得在开发时，不再需要修改系统hosts和启动一个Nginx服务。

hiproxy支持hosts配置文件，同时也扩展了hosts的语法，支持端口号。此外，hiproxy还支跟Nginx配置文件相似语法的配置文件。

## 为什么要开发hiproxy

在前端开发中，如果我们通常会遇到下面的一些问题：

1. 调试线上页面问题，要在本地进行开发，需要能运行后端的项目（Node.js或者Java等项目），__前端工程师在本地搭建一套后端环境，可能代价比较大__。
2. 如果有多个前端工程，__采用一个域名__，__部分工程__ 需要请求 __线上__ 资源，__部分__ 工程请求 __本地__。
3. 为解决跨域等问题，本地开发时需要 __修改Response Header__。
4. 本地开发https站点时，__证书不受信任__。
5. 系统 __hosts修改__ 后，__不会立即生效__。

我们可以使用Nginx来解决上面的问题。Nginx很优秀，也是我们前端开发工程师的一个非常好的朋友。Nginx的配置文件风格，非常直观，编写配置效率很高。

但是，使用Nginx的时候，我们同时需要使用hosts，把相关请求发送到本地的Nginx服务。

此外，大部分情况下，Nginx的配置文件并不会被提交到代码仓库，所以团队中其他开发者之间会互相拷贝配置文件，这样效率比较低，而且一个人修改了配置文件，其他人的配置不会随之更新。对于多个域名的配置，也都是放到一个统一的目录，然后在主配置里面include，这样也不太方便。

__hosts__、__反向代理__、__https__ 和 __缓存__ 这些琐碎的事情，能不能统一解决？

于是有了hiproxy。

## 特色

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

## 理念

我们经过对很多现有开发模式的反思、总结现在遇到的一些问题，基于以下两个理念开发出了hiproxy：

* **工作空间**：hiproxy工作在工作空间（workspace）中，工作空间中所有项目的配置文件都会被hiproxy解析。*工作空间可以通过`-w, --workspace <workspace>`来指定，也可以直接进入到工作空间启动代理服务*。
* **配置文件共享**：配置文件，提交到代码仓库，团队成功共享配置。之前hosts和Nginx配置一般都是不提交到代码仓库，团队成员各自本地维护，成本大并且效率比较低。

## 基本原理

hiproxy的核心功能是请求代理，在代理请求的同时，处理了一些开发中的细节问题，比如https证书自动生成、自动配置浏览器代理等。

下面讲介绍hiproxy的基本原理。

### 请求代理

hiproxy充分利用了[中间人攻击](https://en.wikipedia.org/wiki/Man-in-the-middle_attack)模式，作为中间人在客户端和服务器端转发数据，来实现HTTP以及HTTPS请求的代理。

#### HTTP请求代理

对于**HTTP请求**，如果浏览器配置了代理，浏览器会发送`GET`/`POST`等请求给hiproxy代理。hiproxy收到请求之后，根据用户的`hosts`和`rewrite`规则配置，对请求的信息做一定的修改，然后去相应的服务器请求资源并返回给客户端。

#### HTTPS请求代理

对于**HTTPS请求**，配置代理之后，浏览器会发送`CONNECT`请求到hiproxy服务，hiproxy会新建一个到最终目标服务器的TCP连接（也就是新建了一个隧道）然后在客户端和服务端之间转发数据。

但是这只是能简单代理请求，hiproxy没办法获取到请求的信息，比如参数和Cookie，更没有办法修改响应的数据。如果不需要对请求、响应的信息做对应的修改，这就能满足我们的需求。

如果我们需要实现跟HTTP请求一样的功能，根据请求的信息，对请求和响应做一些修改，需要怎么做呢？

好在我们可以充分利用[中间人攻击](https://en.wikipedia.org/wiki/Man-in-the-middle_attack)这种模式。因为最终的目标服务器能获取到请求的信息，我们可以在hiproxy和最终服务器之间再启动一个中间人服务（这里简称为*M*），当hiproxy收到`CONNECT`请求之后，新建一个到*M*的连接，当*M*收到请求之后，跟HTTP请求代理一样，对请求信息做一些修改，然后去目标服务器请求资源并返回给客户端。

### HTTPS证书生成

在SSL/TLS握手过程中，客户端发送的第一个消息（Client Hello）中，会使用[SNI(Server Name Indication
)](https://en.wikipedia.org/wiki/Server_Name_Indication)扩展，将请求的域名发送给服务器。虽然只发送了域名信息，并没有发送其他的请求路径、参数和cookie等信息，但是对于生成证书来说，有域名已经足够。

当hiproxy获取到请求的域名时：

* 如果用户给对应的域名配置了证书，将用户配置的证书发送给客户端。
* 否则，生成新的域名证书返回给客户端。

### 浏览器窗口

首先，找到系统中浏览器对应的路径。比如在OSX上，查找`<browser-name>.app`，然后启动这个app，并传入参数来配置代理服务器地址。

```bash
<path-to-chrome-app>.app [options] [url]
```

在windows上，会去注册表中查找对应浏览器的`exe`文件路径。然后运行并传递参数。

```bash
<path-to-chrome-app>.exe [options] [url]
```

对于Chrome/Opera浏览器来说，我们需要传递两个方面的参数：

* **代理服务的地址**：`--proxy-pac-url`（PAC代理文件路径）和`--proxy-server`（普通代理地址）二选一，这两种代理hiproxy都支持。

* **用户数据存放的目录**：`--user-data-dir`当传递这个参数，并且这个目录不是浏览器默认存放用户数据的目录，则会新建一个新的浏览器实例，这个示例独立于其他的浏览器窗口，互不影响（这个实例配置了代理，其他浏览器实例的请求不会通过这里配置的代理）。


### 配置文件

hiproxy可以使用hosts来做简单的请求代理，对于复杂的配置使用跟Nginx语法类似的rewrite规则配置。

#### hosts

跟系统`hosts`语法一致，此外也支持端口号。hosts只能配置域名对应的ip和端口号，不支持详细的路由配置以及对请求响应做修改。更多详细信息请查看[hosts](../configuration/hosts.md)。

#### hosts配置示例

```bash
# comment
127.0.0.1 example.com

# ip + port
127.0.0.1:8800 blog.example.com life.example.com
```

#### rewrite

rewrite规则配置文件，可以使用更复杂的配置、满足复杂的使用场景。可以对路由进行详细的配置以及对请求响应做修改。rewrite规则配置的语法，跟Nginx语法非常类似。更多详细信息请查看[rewrite](../configuration/rewrite.md)。

#### rewrite配置示例

```bash
# 全局变量
set $port 8899;
set $ip   127.0.0.1;
set $online 210.0.0.0;

# 域名配置
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

### 插件机制

hiproxy启动的时候，会自动从npm全局模块所在目录（`npm root -g`）查找以`hiproxy-plugin-`开头的模块，找到这些模块之后自动解析插件内容。

因此，我们只需要独立全局安装需要的插件，不用去升级hiproxy，hiproxy插件的开发也是独立的，插件项目本身不依赖hiproxy。

详细的插件相关文档请查看[hiproxy插件机制](../developer/plugin.md)；


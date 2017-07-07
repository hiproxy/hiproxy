## 简介

hiproxy是一个基于Node.js开发的轻量级网络代理工具，主要目的是为了解决多个开发者在开发过程中遇到的hosts管理和反向代理的问题。使得在开发时，不再需要修改系统hosts和启动一个Nginx服务。

hiproxy扩展了hosts的语法，支持端口号。此外，hiproxy还支持通过类似于nginx配置文件的语法来配置代理。

hiproxy会在当前工作空间下查找所有项目中的hosts文件和rewrite配置文件，然后启动一个浏览器窗口，并自动为这一个浏览器窗口配置好代理。这个窗口独立于其他窗口，其他浏览器的网络请求不会经过hiproxy代理，只有这个窗口中的请求，才会经过hiproxy处理。

当接收到请求后，hiproxy会查找hosts或者rewrite中的配置信息，根据配置信息去请求相应的资源返回给浏览器。这样你没有修改系统的hosts文件，也没有启动一个Nginx服务来做反向代理，但是你已经实现了网络的代理和转发。

## 体验

我们已经准备了一个工作空间示例，可以查看<https://github.com/hiproxy/hiproxy-example>。下面介绍一下，如果使用这个项目来体验hiproxy。

### 安装hiproxy

```bash
npm install hiproxy -g
```

也可以使用`yarn`来安装：

```bash
yarn global add hiproxy
```

如果要体验最新的功能（可能不稳定），你也可以直接从github源码安装：
```bash
npm install -g hiproxy/hiproxy
```

### Clone示例项目

我们已经写好了三个简单的项目，你只需要把她克隆到本地，直接启动服务就好了。

```bash
# 克隆源码
git clone https://github.com/hiproxy/hiproxy-example.git

# 进入源码根目录
cd hiproxy-example

# 安装依赖
npm install
```

### 工程介绍

这个项目的目录结果如下：

```bash
.
├── LICENSE
├── README.md
├── package.json
├── start.js          # 启动服务
└── workspace         # 工作空间
    ├── blog-app      # blog应用示例
    │   ├── app.js    # express app
    │   ├── hosts     # hosts文件
    │   ├── public    # 静态资源
    │   └── rewrite   # rewrite配置文件
    ├── main-app      # 主应用示例
    │   ├── app.js    # express app
    │   ├── hosts     # hosts文件
    │   └── public    # 静态资源
    └── news-app      # 新闻应用示例
        ├── app.js    # express app
        └── hosts     # hosts文件
```

在`workspace`目录下，有三个应用，每个应用都有一个`hosts`文件：

```bash
# main-app hosts
127.0.0.1:8000 www.example.com
```

```bash
# blog-app hosts
127.0.0.1:8001 blog.example.com
```

```bash
# news-app hosts
127.0.0.1:8002 news.example.com
```

在blog-app中，还有一个`rewrite`文件，内容如下：

```bash
# rewrite rules
domain blog.example.io {
  # rewrite / to 8001;
  location / {
    proxy_pass http://127.0.0.1:8001/;
  }

  # static files
  location /static/ {
    alias ./public/;

    set_header server hiproxy;
    set_cookie server hiproxy;
  }
}
```

### 启动示例项目提供的服务

克隆完源码并安装好依赖后，就可以启动示例项目提供的服务了。

1. 在示例项目根目录执行下面的命令，启动测试服务：

```bash
npm start
```

2. 然后进入workpace目录，启动hiproxy服务：

```bash
hiproxy start --open --port 8008 --pac-proxy
```

执行上面的命令之后，hiproxy会在当前工作空间`workspace`中，查找所有项目（`main-app`/`blog-app`/`news-app`）的hosts文件和rewrite文件，解析里面配置的信息。监听到新请求之后，根据这里面配置的规则转发请求或者返回本地文件。

然后hiproxy自动打开一个浏览器窗口，并配置好代理。

### 访问页面

打开的浏览器，默认打开了hiproxy的首页，里面可以查看到一些简要信息。你可以点击自动代理文件链接，查看自动代理文件(pac文件)的内容。

你可以尝试访问下面的几个链接：

* <http://blog.example.com/>
* <http://www.example.com/>
* <http://news.example.com/>
* <http://blog.example.io/>
* <http://blog.example.io/static/>


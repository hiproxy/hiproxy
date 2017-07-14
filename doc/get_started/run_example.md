# Run Example

> 如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！
>
> If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

## 项目简介

我们准备了一个[示例工程](https://github.com/hiproxy/hiproxy-example)，里面有一个工作空间（workspace），工作空间中包含三个简单的项目。三个项目分别使用端口`8000`、`8001`和`8002`。

同时，我们也提供了一个脚本`server.js`，来启动三个服务，可以使用`npm start`或者`node start`。

这个项目的目录结构如下：

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

...

## 运行步骤

### 第一步：clone代码

示例项目的代码托管在github上，首先使用Git把代码clone到本地：

```bash
git clone https://github.com/hiproxy/hiproxy-example.git
```

### 第二步：安装依赖

然后进入项目根目录（`hiproxy-example/`），安装需要的第三方依赖：

```bash
cd hiproxy-example
npm install
```

### 第三步：启动服务

克隆完源码并安装好依赖后，就可以启动示例项目提供的服务了。在`hiproxy-example/`下执行：

```bash
npm start
```

### 第四步：启动hiproxy

上面的准备工作完成之后，我们就可以启动hiproxy来体验他的功能了，在`hiproxy-example/`下执行：

```bash
hiproxy start --https --open --workspace ./workspace
```

### 第五步：访问测试页面

在执行上一步的命令后，hiproxy会贴心的打开一个浏览器窗口并配置好代理。在这个浏览器中访问下面任意一个网址即可查看效果：

* <http://blog.example.com/>
* <http://www.example.com/>
* <http://news.example.com/>
* <http://blog.example.io/>
* <http://blog.example.io/static/>


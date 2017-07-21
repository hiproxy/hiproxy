# 插件开发指南

hiproxy提供了一套插件开发机制，这个机制很简单：插件开发完成后，将插件安装到全局，hiproxy启动时会自动查找安装的所有插件。

开发者开发新插件时，可以参考`hiproxy-plugin-example`: <https://github.com/hiproxy/hiproxy-plugin-example>。这是一个完整的插件示例，你可以基于这个示例修改。

<br />

## 插件结构

hiproxy插件必须满足三个条件：

1. __插件必须作为一个独立的npm模块，这个模块需要导出一个对象，包括三个属性__
```js
module.exports = {
  // CLI commands
  commands: commands,

  // Rewrite config redirectives
  directives: directives,
  
  // HTTP server routes
  routes: routes
};
```

* **commands**: `<Array>`，用来扩展`hiproxy`的CLI命令，数组中每个对象作为一个命令配置，具体配置见[命令配置](#command-config)。

* **directives**: `<Array>`，用来扩展`hiproxy`的rewrite指令，数组中每个对象作为一个指令配置，具体配置见[指令配置](#directive-config)。

* **routes**: `<Array>`，用来扩展`hiproxy`的页面路由，数组中每个对象作为一个路由配置，具体配置见[路由配置](#route-config)。

例子：<https://github.com/hiproxy/hiproxy-plugin-example/blob/master/index.js#L14-L23>

2. __插件模块必须安装到全局__

3. __插件名称必须以`hiproxy-plugin-`开头__

<br />

<a name="command-config"></a>

### 命令配置

命令可以配置的内容为：`命令名称`、`描述`、`使用方法`、`处理函数`和`命令选项参数`。对应的字段为：

* 命令名称（command）：`<String>`，比如：`'hello'`。
* 描述信息（describe）：`<String>`，简单介绍命令的作用以及其他的信息，比如：`'A test command that say hello to you.'`。
* 使用方法（usage）：`<String>`，命令的使用方法提示信息，比如：`'hello [--name <name>] [-xodD]'`。
* 处理函数（fn）：`<Function>`，执行命令时，调用的函数。函数调用时`this`值为命令行参数解析后的对象。
* 命令选项（option）：`<Object>`，命令对应的选项，`key:value`形式。可以参考<https://github.com/hemsl/hemsl>。

一个完整的命令示例如下：

```js
{
  command: 'hello',
  describe: 'A test command that say hello to you.',
  usage: 'hello [--name <name>] [-xodD]',
  fn: function () {
    var cliArgs = this;
    if (cliArgs.name ) {
      console.log('your name is', cliArgs.name.green);
    }

    if (cliArgs.age ) {
      console.log('your are', cliArgs.age.green, 'years old');
    }
  },
  options: {
    'name <name>': {
      alias: 'n',
      describe: 'your name'
    },
    'age': {
      alias: 'a',
      describe: 'your age'
    }
  }
}
```

<br />

<a name="directive-config"></a>

### 指令配置

命令可以配置的内容为：`指令名称`、`作用域`和`处理函数`。对应的字段为：

* 指令名称（name）：`<String>`，比如：`'add'`。
* 作用域（scope）：`<Array>`，指令对应的作用域，只有在这里指定的作用域里面才会执行。可选择的作用域为：`global`、`domain`、`location`、`request`和`response`。
* 处理函数（fn）：`<Function>`，执行指令时，调用的函数。

一个完整的指令示例如下：

```js
{
  name: 'add',
  scope: ['global', 'domain', 'location'],
  fn: function (key, a, b) {
    var props = this.props;
    var value = Number(a) + Number(b);

    this.props[key] = value;
  }
}
```

<br />

<a name="route-config"></a>

### 路由配置

路由可以配置的内容为：`路由规则`和`渲染函数`。对应的字段为：

* 路由规则（name）：`<String>`，比如：`'add'`。
* 渲染函数（render）：`<Function>`，渲染页面，接收三个参数：`(route, request, response)`，`route`为url匹配后的对象，细节可以查看<https://www.npmjs.com/package/url-pattern>。

一个完整的指令示例如下：

```js
{
  route: '/test(/:pageName)',
  render: function (route, request, response) {
    response.writeHead(200, {
      'Content-Type': 'text/html',
      'Powder-By': 'hiproxy-plugin-example'
    });

    var serverInfo = {
      route: route,
      pageID: route.pageName,
      time: new Date(),
      serverState: {
        http_port: global.hiproxyServer.httpPort,
        https_port: global.hiproxyServer.httpsPort,
        cliArgs: global.args,
        process_id: process.pid
      }
    };

    response.end('<pre>' + JSON.stringify(serverInfo, null, 4) + '</pre>');
  }
}
```

## 温馨提示

由于hiproxy只会从`npm root -g`所在的目录去查找名称以`hiproxy-plugin-`开头的插件，所以在本地开发时，hiproxy加载不到新的插件。

可以使用`npm link`，创建一个符号链接，这样就能一边开发一边调试开发中的插件。详情请参考npm文档：[npm link](https://docs.npmjs.com/cli/link)。






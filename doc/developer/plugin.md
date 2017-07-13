# Plugin 插件开发指南

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

* **commands**: `<Array>`，用来扩展`hiproxy`的CLI命令，数组中每个对象作为一个命令配置，具体配置见[命令配置](cli_command.md)。

* **directives**: `<Array>`，用来扩展`hiproxy`的rewrite指令，数组中每个对象作为一个指令配置，具体配置见[指令配置](rewrite_directive.md)。

* **routes**: `<Array>`，用来扩展`hiproxy`的页面路由，数组中每个对象作为一个路由配置，具体配置见[路由配置](route.md)。

2. __插件模块必须安装到全局__

3. __插件名称必须以`hiproxy-plugin-`开头__

例子：<https://github.com/hiproxy/hiproxy-plugin-example/blob/master/index.js#L14-L23>

## 温馨提示

由于hiproxy只会从`npm root -g`所在的目录去查找名称以`hiproxy-plugin-`开头的插件，所以在本地开发时，hiproxy加载不到新的插件。

可以使用`npm link`，创建一个符号链接，这样就能一边开发一边调试开发中的插件。详情请参考npm文档：[npm link](https://docs.npmjs.com/cli/link)。

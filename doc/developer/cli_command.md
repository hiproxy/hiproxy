# CLI Command 命令配置

如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！

If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

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



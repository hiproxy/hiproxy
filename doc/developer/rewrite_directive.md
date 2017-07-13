# Rewrite Directive 指令配置

如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！

If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

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

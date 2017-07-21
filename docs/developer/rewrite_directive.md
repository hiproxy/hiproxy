# Rewrite Directive 指令配置

> 如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！
> 
> If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

## 简介

**rewrite指令**可以配置的内容为：`指令名称`、`作用域`和`处理函数`。对应的字段为：

* **指令名称（name）**：`<String>`，比如：`'add'`。
* **作用域（scope）**：`<Array>`，指令对应的作用域，只有在这里指定的作用域里面才会执行。可选择的作用域为：`global`、`domain`、`location`、`request`和`response`。
* **处理函数（fn）**：`<Function>`，执行指令时，调用的函数，详细信息请查看[处理函数](#handler-function)。

## 示例

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

<a name="handler-function"></a>

## 处理函数

处理函数会在hiproxy执行指令的时候被调用，传入rewrite配置文件中这个指令对应的参数，并设置`this`。

### 参数

处理函数会被调用是，会传入rewrite配置文件中这个指令对应的参数，例如配置了指令`proxy_set_header Host hiproxy.org`，那么在执行**处理函数**时，传入的参数为：`('Host', 'hiproxy.org')`

### this

不同作用域中的指令执行时，this值也不同，下面列举了所有作用域指令对应的this值:

- **global**: 整个rewrite对象-`{props: <Object>, domains: <Array>, commands: <Array>}}`
- **domain**: domain对象-`{domain: <String>, props: <Object>, location: <Array>, commands: <Array>}}`
- **location**: location对象-`{props: <Object>, location: <String>, commands: <Array>}}`
- **request**: `{request: <http.IncomingMessage>}`
- **response**: `{response: <http.ServerResponse>}`

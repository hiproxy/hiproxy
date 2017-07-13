# Route 路由配置

如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！

If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!


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
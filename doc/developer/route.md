# Route 页面路由配置

> 如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！
> 
> If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

## 简介

hiproxy启动服务之后，可以访问`http://127.0.0.1:<port>/`页面查看服务的一些基本信息。

除了上面的页面之外，hiproxy还提供了增加新页面的功能。比如插件[hiproxy-plugin-dashboard](https://github.com/hiproxy/hiproxy-plugin-dashboard)，为hiproxy增加了一个在线查看服务信息以及修改配置文件的页面，地址为：`http://127.0.0.1:<port>/dashboard/`。


## 配置内容

页面路由可以配置的内容为：`路由规则`和`渲染函数`。对应的字段为：

* 路由规则（route）：`<String>`，页面的地址模式，比如：`'/dashboard(/:page)'`，细节可以查看<https://www.npmjs.com/package/url-pattern>。
* 渲染函数（render）：`<Function>`，渲染页面，接收三个参数：`(route, request, response)`。

## render方法

当用户访问对应的页面时，`render()`方法会被调用，传入三个参数`(route, request, response)`。

- `route`: `<Object>`，url模式匹配后的对象，比如配置了`/test(/:pageName)`之后，访问`/test/home`时`route`的值为：`{pageName: 'home'}`。
- `request`: `<http.IncomingMessage>`，http请求对象。
- `response`: `<http.ServerResponse>`，http响应对象。

## 示例

一个完整的页面扩展示例如下：

```js
{
  route: '/test(/:pageName)',
  render: function (route, request, response) {
    // 这里面可以使用全局变量`hiproxyServer`来获取hiproxy服务实例
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

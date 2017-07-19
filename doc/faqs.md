# FAQs

### hiproxy的核心目的／功能是什么？

hiproxy的核心功能是代理请求，主要是为了解决前端开发工程师在本地开发过程中遇到的

- `hosts`修改后由于DNS缓存不能立刻生效
- 需要使用Nginx来做反向代理
- 自签名HTTPS证书不受信任
- 每个人都在本地维护环境配置文件（hosts／Nginx配置）
- ...

<br/>

### hiproxy跟Charles／Fiddler有什么区别？

hiproxy跟Charles/Fiddler都有抓包、请求代理的功能，很多核心的功能基本类似。只不过hiproxy是一个命令行的工具，使用配置文件来配置。

此外，hiproxy现在没有查看网络请求的具体内容的界面，将来会通过插件开发，敬请期待。

<br/>

### hiproxy根证书怎么获取／导入？

可以查看文档[获取／导入SSL证书](./configuration/ssl_certificate.md)。

<br/>

### hiproxy的rewrite配置文件完全兼容Nginx配置吗？

不兼容，hiproxy的rewrite规则配置文件跟Nginx的配置文件本身没有任何关系。

从语法上看，hiproxy的rewrite配置文件借鉴了Nginx配置的语法。核心的语法跟Nginx的语法一致，但是也有些语法是hiproxy特有的，并不完全跟Nginx语法一致，比如：

```bash
# base rule
http://hiproxy.org/api/login.do => http://127.0.0.1:9999/api/login.json;

# domain
hiproxy.org => {
  # ...
}
```

此外，也有部分指令采用Nginx的指令名称且功能基本类似，比如`proxy_pass`、`set`、`ssl_certificate`和`ssl_certificate_key`等。但是也**不保证所有的功能细节跟Nginx的指令保持一致**。详细的指令功能说明请参考[指令](./configuration/rewrite_directive.md)

<br/>

### hiproxy中如何使用自己的SSL证书？

默认情况下，在代理https请求的时候，hiproxy会**自动生成证书**，并使用hiproxy自定义的CA证书签名。用户只需要导入hiproxy的根证书。

如果用户需要使用自定义的证书，可以使用hiproxy提供的指令来配置：

```
ssl_certificate     ./hiproxy.org.crt;
ssl_certificate_key ./hiproxy.org.key;
```

<br/>

### ...

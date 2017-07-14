# FAQs

### hiproxy的核心目的／功能是什么？

hiproxy的核心功能是代理请求，主要是为了解决前端开发工程师在本地开发过程中遇到的

- `hosts`修改后由于DNS缓存不能立刻生效
- 需要使用Nginx来做反向代理
- 自签名HTTPS证书不受信任
- ...

### hiproxy跟Charles／Fiddler有什么区别？

### hiproxy根证书怎么获取／导入？

### hiproxy的rewrite配置文件完全兼容Nginx配置吗？

### hiproxy的rewrite配置文件跟Nginx配置文件有什么关系？

hiproxy的rewrite规则配置文件跟Nginx的配置文件本身没有任何关系。

但是，hiproxy的配置文件，借鉴了Nginx配置文件的语法。也有部分指令采用Nginx的指令名称且功能基本类似，比如`proxy_pass`、`set`、`ssl_certificate`和`ssl_certificate_key`等。

hiproxy的语法也**并不是完全跟Nginx配置语法一致**，比如hiproxy的rewrite规则配置文件支持简洁语法：

```
# base rule
http://hiproxy.org/api/login.do => http://127.0.0.1:9999/api/login.json;

# domain
hiproxy.org => {
  # ...
}
```


### hiproxy中如何使用自己的SSL证书？

默认情况下，在代理https请求的时候，hiproxy会**自动生成证书**，并使用hiproxy自定义的CA证书签名。用户只需要导入hiproxy的根证书。

如果用户需要使用自定义的证书，可以使用hiproxy提供的指令来配置：

```
ssl_certificate     ./hiproxy.org.crt;
ssl_certificate_key ./hiproxy.org.key;
```

### ...

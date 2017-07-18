# Rewrite Directive

> 如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！

> If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

## 指令

`指令`（也称：`命令`）用于设置变量，或者对request/response做一些操作。

### 全局指令

全局指令，用来在全局作用域中做一些配置。

#### set

*作用*：定义变量

*参数*：

```bash
key：变量名称
value：值
```

*例子*：

```bash
set $server hiipack;
```

### 代理请求相关指令 

代理请求相关的指令，用于操作代理服务向目标服务器发送请求的`Request`对象。

#### proxy_pass

*作用*：设置请求转发的目标地址

*参数*：

```bash
url：要转发的地址
```

*例子*：

```bash
proxy_pass http://some.example.com/some/path/;
```


#### proxy_set_header 

*作用*：设置请求头部字段

*参数*：

```bash
key：字段名称
value：字段值
```

*例子*：

```bash
proxy_set_header Host some.example.com
```

#### proxy_hide_header 

*作用*：删除请求头部字段

*参数*：

```bash
key: 要删除的字段名称
```

*例子*：

```bash
proxy_set_header Host some.example.com
```

#### proxy_set_cookie 

*作用*：设置请求Cookie

*参数*：

```bash
key：Cookie名称
value：Cookie值
```

*例子*：

```bash
proxy_set_cookie from hiproxy;
```

#### proxy_hide_cookie 

*作用*：删除请求Cookie字段

*参数*：

```bash
key：Cookie名称
```

*例子*：

```bash
proxy_hide_cookie from;
```

### 代理响应相关指令 

代理响应相关的指令用于配置代理服务器响应浏览器的`Response`对象。

#### set_header 

*作用*：添加Header字段

*参数*：

```bash
key：Header字段名称
value：Header字段的值
```

*例子*：

```bash
set_header SERVER hiproxy;
```

#### hide_header 

*作用*：删除Header字段

*参数*：

```bash
key：Header字段名称
```

*例子*：

```bash
hide_header Server;
```

#### set_cookie 

*作用*：设置Cookie字段

*参数*：

```bash
key：Cookie名称
value：Cookie值
```
*例子*

```bash
set_cookie SESSION_ID 2BF36A09CB35FD71E;
```

#### hide_cookie 

*作用*：删除Cookie字段

*参数*：

```bash
key：Cookie名称
```

*例子*：

```bash
hide_cookie SESSION_ID;
```

#### alias 

*作用*：将对应的`location`映射到本地目录

*参数*：

```bash
path：本地路径，绝对路径
```

*例子*：

```bash
alias /Users/zdying/some/path/;
```

#### send_file 

*作用*：返回指定的文件

*参数*：

```bash
file_name：文件名称
```

*例子*：

```bash
send_file index.html;
```

#### root 

*作用*：将对应的`location`映射到本地目录时的默认文件

*参数*：

```bash
file_name：文件名称, 默认`index.html`
```

*例子*：

```bash
root index.html;
```







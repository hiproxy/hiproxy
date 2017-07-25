# Rewrite Directive

> 如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！
>
> If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

## 指令

`指令`（也称：`命令`）用于设置变量，或者对request/response做一些操作。

### set

描述：定义变量

语法：**set** key value

**作用域链**：global, domain, location

例子：

```bash
set $server hiipack;
```

### 代理请求相关指令

代理请求相关的指令，用于操作代理服务向目标服务器发送请求的`Request`对象。

**作用域链**：domain, location

#### * proxy_set_header

描述：设置请求头部字段

语法：**proxy_set_header** key value

例子：

```bash
proxy_set_header Host some.example.com;
```

#### * proxy_hide_header

描述：删除请求头部字段

语法：**proxy_hide_header** key

例子：

```bash
proxy_hide_header Host;
```

#### * proxy_set_cookie

描述：设置请求Cookie

语法：**proxy_set_cookie** key value

例子：

```bash
proxy_set_cookie from hiproxy;
```

#### * proxy_hide_cookie

描述：删除请求Cookie字段

语法：**proxy_hide_cookie** key

例子：

```bash
proxy_hide_cookie from;
```

### 代理响应相关指令

代理响应相关的指令用于配置代理服务器响应浏览器的`Response`对象。

**作用域链**：domain, location

#### * set_header

描述：添加Header字段

语法：**set_header** key value

例子：

```bash
set_header SERVER hiproxy;
```

#### * hide_header

描述：删除Header字段

语法：**hide_header** key

*例子*：

```bash
hide_header SERVER;
```

#### * set_cookie

描述：设置Cookie字段

语法：**set_cookie** key value

例子

```bash
set_cookie SESSION_ID 2BF36A09CB35FD71E;
```

#### * hide_cookie

描述：删除Cookie字段

语法：**hide_cookie** key

*例子*：

```bash
hide_cookie SESSION_ID;
```

#### * send_file

描述：返回指定的文件

语法：**send_file** file_name

例子：

```bash
send_file index.html;
send_file /site/index.html;
```

#### * echo

描述：返回指定内容

语法：**echo** string

例子：

```bash
echo <h1>hello_echo</h1>;
echo <p>finish</p>;
```


### domain内部指令

只在同一个domain内有效，且覆盖全局同名指令

**作用域链**：domain

#### * ssl_certificate

描述：手动指定证书文件

参数：**ssl_certificate** file.crt（只支持相对路径，后期完善）

例子：

```bash
example.com => {
    ssl_certificate /user/root/.hiproxy/cert/example.crt;
}

```

#### * ssl_certificate_key

描述：手动指定私钥文件

参数：**ssl_certificate_key** file.key（只支持相对路径，后期完善）

例子：

```bash
example.com => {
    ssl_certificate_key /user/root/.hiproxy/cert/example.key;
}

```


### location内部指令

只在同一个location内有效，且覆盖全局及domain同名指令

**作用域链**：domain, location

#### * proxy_pass

描述：设置请求转发的目标地址

参数：**proxy_pass** url

例子：

```bash
proxy_pass http://some.example.com/some/path/;
```

#### * alias

描述：将对应的`location`映射到本地目录

参数：**alias** path

例子：

```bash
alias /Users/root/some/path/;
```

#### * root

描述：将对应的`location`映射到本地目录时的默认文件，默认文件名为`index.html`

参数：**root** file_name

*例子*：

```bash
root app.html;
```

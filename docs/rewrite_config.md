# rewrite配置文件 

hiproxy 代理的配置文件必须位于项目根目录，文件名为：`rewrite`。

启动本地服务时，hiproxy只会寻找当前工作目录中所有项目根目录下的`rewrite`文件。


## 代理使用方法

### 推荐方式 

要使用 hiproxy 的代理功能，推荐使用自动打开浏览器窗口的方式：

1. **创建代理配置文件**
2. **启动本地服务时添加参数: **`--open`** 或者 **`-o`**

> 提示:
> 
> `-o`或者`--open` ==&gt; 打开浏览器窗口，默认Chrome

自动打开浏览器窗口的好处是：

* 自动配置代理，用户无需自己手动配置
* 没有hosts缓存问题
* 新打开的窗口独立于其他的浏览器窗口，互不影响

### 手动配置 

目前，hiproxy 打开的 Chrome 浏览器窗口，不会加载用户以前的配置、插件，这样从某种意义上不是很方便。

如果不让 hiproxy 打开浏览器窗口，代理服务启动后，需要自己手动设置浏览器代理或者系统代理。

代理地址：

```
127.0.0.1:4936
```

这样浏览器里面**所有的**请求就会经过 hiproxy 的启动在`4936`的服务。

这样会有一个问题就是，那些原本不需要走代理的地址，其实是没有必要通过 hiproxy 代理的，这样增加了 hiproxy 的负担，也影响了响应的速度。

因此，hiproxy 还提供了一种代理的方式：**_自动代理_**（有关自动代理的内容，可以参考：[Proxy-Auto-Conifg](https://en.wikipedia.org/wiki/Proxy_auto-config) 或者 [PAC（代理自动配置）](http://baike.baidu.com/item/PAC/16292100)）。

有了自动代理，**只有用户配置的**`hosts`**中的域名和**`rewrite`**中的域名才会通过代理服务器**。

要使用自动代理，可以在 hiproxy 启动日志中找到代理文件的路径，比如下面最后一行中的地址：

```bash
# hiproxy 启动日志
  _     _  
 | |   (_) 
 | |__  _      Proxy address: 127.0.0.1:5525
 | '_ \| |     Https address: 127.0.0.1:10010
 | | | | |     Proxy file at: http://127.0.0.1:5525/proxy.pac
 |_| |_|_| 
```

# 配置语法 

## 变量 

#### 语法

```bash
$变量名
```

#### 例子

```bash
# 使用变量
$var_name

# 定义变量
set $var_name value
```

## domain 

`domain` 用来指定一个域名，这个域名的所有配置都在 `domain` 块中。

#### 语法：

```bash
[域名|变量] => {
    # ...
}
```

#### 例子

```bash
# 直接使用域名
some.example.com => {
    # ...
}

# 或者使用变量
$domain => {
    # ...
}
```

## location 

`location` 用来指定域名中的一个具体的路径，这个路径的所有配置都在 `location` 块中。

注意:`location`**必须位于**`domain`**块中**。

#### 语法

```bash
location [目录|文件|正则表达式|变量] {
    # ...
}
```

#### 例子

```bash
# 目录
location /some/path/ {
    # ...
}

# 具体文件
location /some/file.htm {
    # ...
}

# 正则表达式

location ~ /^\/some\/(path|path1)\/.*/ {
    # ...
}

# 变量

location $some/$path {
    # ...
} 
```

## 命令 

命令用于设置一些变量，或者对`request`\/`response`做一些操作。

#### 语法

```bash
命令 参数1 参数2 ... 参数N
```

#### 例子

```bash
# 设置代理时的头部
proxy_set_header Host some.example.com;

# 设置response的cookie
set_cookie UserID some_user_id;
```

## 注释 

用来注释某些不需要的内容，**只支持单行注释**。

#### 语法

```bash
# 注释内容
```

#### 例子

```bash
# 注释内容
set var value; # 设置变量
```

#### 简写语法

简写语法，可以用来定义一些基本的规则，不需要写`location`和其他的命令.

#### 语法

```bash
域名 ==> 域名|路径
```

#### 例子

```bash
json.example.com => 127.0.0.1:8800;
```

## 完整的例子 

```bash
## url rewrite rules
# page.example.com => hii.com;
## json.example.com => 127.0.0.1:8800;

### rewrite folder

# api.example.com/user/ => {
#     proxy_pass other.example.com/user/;
#
#     ## proxy request config
#     proxy_set_header host api.example.com;
#     proxy_set_header other value;
#     proxy_hide_header key;
#
#     proxy_set_cookie userid 20150910121359;
#     proxy_hide_cookie sessionid;
#
#     ## response config
#     set_header Access-Control-Allow-Origin *; 
#
#     # allow CORS
#     set_cookie sessionID E3BF86A90ACDD6C5FF49ACB09;
#     hide_header key;
#     hide_cookie key;
# }

## regexp support
# ~ /\/(demo|example)\/([^\/]*\.(html|htm))$/ => {
#    proxy_pass http://127.0.0.1:9999/$1/src/$2;
#
#    set_header Access-Control-Allow-Origin *;
# }

## simple rewrite rule
usercenter.example.com => $domain/test;
flight.qunar.com/flight_qzz => 127.0.0.1:8800/flight_qzz;

set $domain api.example.com;
set $local 127.0.0.1:8800;
set $flight flight;
set $test $flight.example.com;
set $id 1234567;

## standard rewrite url
$domain => {
    proxy_pass http://127.0.0.1:8800/news/src/mock/;
    set $id 1234;
    set $mock_user user_$id;
    set_header Host $domain;
    set_header UserID $mock_user;
    set_header Access-Control-Allow-Origin *;
}

# api.example.com => {
#     proxy_pass http://$local/news/src/mock/list.json;
#     set_header Access-Control-Allow-Origin *;
# }

api.qunar.com => {
    set_header Access-Control-Allow-Origin *;
    set $node_server 127.0.0.1:3008;
    set $order order;
    set $cookie1 login=true;expires=20160909;

    location /$flight/$order/detail {
        proxy_pass http://$node_server/user/?domain=$domain;
        set_header Set-Cookie userID 200908204140;
    }

    location ~ /\/(usercenter|userinfo)/ {
        set $cookie login=true;expires=20180808;
        proxy_pass http://127.0.0.1:3008/info/;
        set_cookie userID 200908204140;
        set $id user_iddddd;
        set_cookie $flight zdy_$id;
    }
}
```


# 作用域 

作用域主要使用于**变量查找**和**指令执行**。

### 作用域

hiproxy 配置文件中涉及到的作用域有三种：

* _全局作用域_：这里的变量可以在任何地方访问到
* _domain作用域_：位于全局作用域下一级
* _location作用域_：位于domain作用域下一级

### 作用域层级关系

```
global
    |- domain
    |   |- location
    |   |- location
    |   |- ...
    |- domain
    |   |- location
    |   |- location
    |   |- ...
```

### 变量查找

当前作用域中查找变量的规则为：

1. 如果当前作用域有这个变量，_返回_ 这个变量的值
2. 查找上一级作用域，如果上一级作用域中有这个变量，_返回_ 这个变量的值。
3. 否则，如果上一级作用域是全局作用域，_返回_ 变量名称（包括`$`符号\)。
4. _重复步骤__**\[**__**2-3\]**_

### 指令执行

下一级作用域中的指令在对应的时机（request／response）会自动执行，此外，还会执行上一级作用域中的指令，比如：

```
www1.test.com => {
    # 1    
    proxy_set_header Host www.test.com;

    location / {
        # 2
        proxy_pass http://52.88.88.88/;
    }

    location /index.html {
        # 3
        proxy_pass http://127.0.0.1:8800/opgirl_global/view/index.html;
    }

    location ~ /\/(native|gallery|picture|font|6cn)\/(.*)/ {
        # 4
        proxy_pass http://88.88.88.88/$1/$2;
    }
}
```

上面的配置中，\#2、\#3和\#4处，都会执行配置在\#1处的指令，也就是说: 

> `/`、`/index.html`和`/\/(native|gallery|picture|font|6cn)\/(.*)/`对应的请求，都会加上请求头部`Host`，值为`www.test.com`

# All Commands

See [Rewrite directives](https://github.com/zdying/hiproxy/blob/master/docs/rewrite_directives.md)
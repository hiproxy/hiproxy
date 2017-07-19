# Rewrite built in variables - rewrite内置变量

> 如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！
>
> If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

hiproxy的rewrite规则配置文件中，我们可以自己定义全局变量（在全局作用域中使用`set $var value`），也可以在其他作用域中定义变量；

hiproxy内置了一些变量，这些内置变量可以在相应的作用域中直接使用，不需要去定义并赋值，而且这些内置变量也不能被用户重新定义覆盖。

## 全局变量

这些全局变量，在配置文件的**任何地方都可以使用**。

> 提示：hiproxy暂时没有内置的全局变量。将来会添加！

## location块级变量

这些变量，只能在`location`块中使用，这些变量主要是存储与请求相关的一些信息，比如请求的参数（`$query_string`）、Cookie（`$cookie_name`）和host（`$host`)等。现在支持的所有内置变量：

### $host
当前请求的URL对应的`host`或者请求头部的`Host`字段。

### $hostname
当前请求的URL对应的`hostname`或者请求头部的`Host`字段对应的`hostname`。

### $server_port
请求的服务端口号，默认`80`。

### $search
请求的参数字符串（包括`?`），比如`?from=app&v=19482848253`。

### $query_string
请求的参数字符串（**不包括`?`**），比如`from=app&v=19482848253`。

### $scheme
请求的协议，`http`或者`https`。

### $request_uri
请求的完整地址，比如`http://hiproxy.org:8081/doc/index.html?from=google&v=_1847295727524#get-started`。

### $path
请求的`path`（包括参数），比如`/doc/index.html?from=google&v=_1847295727524#get-started`。

### $path_name
请求的`path_name`（不包括参数），比如`/doc/index.html`。

### $hash
请求url中的`hash`(包括`#`)，比如'#get-started'。

### $hash_value
请求url中的`hash`值(不包括`#`)，比如'get-started'。

### $uri
同`$request_uri`。

### $cookie_*name*
`cookie`的值，`name`表示字段名称，这个名称中的大写字母都改成了小写，`-`替换成了`_`。比如`$cookie_userId`表示`cookie`中`useId`的值。

### $http_*name*
请求头（request）中的字段值，`name`表示字段名称，这个名称中的大写字母都改成了小写，`-`替换成了`_`。比如请求头信息中包含`User-Agent: user agent`，可以使用变量`$http_user_agent`来获取这个值。

### $arg_*name*
请求参数的值，`name`表示字段名称，这个名称中的大写字母都改成了小写，`-`替换成了`_`。比如请求参数为`?from=google&v=_1847295727524`，可以通过`$arg_from`来获取`from`的值。


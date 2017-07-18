# Rewrite built in variables - rewrite内置变量

> 如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！
>
> If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

hiproxy的rewrite规则配置文件中，我们可以自己定义全局变量（在全局作用域中使用`set $var value`），也可以在其他作用域中定义变量；

hiproxy内置了一些变量，这些内置变量可以在相应的作用域中直接使用，不需要去定义并赋值，而且这些内置变量也不能被用户重新定义覆盖。

## 全局变量

这些全局变量，在配置文件的**任何地方都可以使用**。

...

## location块级变量

这些变量，只能在`location`块中使用，这些变量主要是存储与请求相关的一些信息，比如请求的参数（`$query_string`）、Cookie（`$cookie_name`）和host（`$host`)等。现在支持的所有内置变量：

### $host
host name from the request line, or host name from the “Host” request header field, or the server name matching a request.

### $hostname
host name.

### $search
arguments in the request line.

### $query_string
arguments in the request line.

### $port/$server_port
port of the server which accepted a request.

### $scheme
request scheme, “http” or “https”.

### $request_uri
the request path.

### $request_filename
the request file name.

### hash
the request hash.

### $uri
full original request URI (with arguments)


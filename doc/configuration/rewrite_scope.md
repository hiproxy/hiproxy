# Rewrite Context

> 如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！

> If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

## 代码块

hiproxy的代码块，分为三类：

* *全局块*：所有的配置文件中不在其他块的代码，都在全局块中；
* *domain块*：位于全局块中；
* *location块*：位于domain块中；

## 作用域

hiproxy 配置文件中涉及到的作用域有5种：

* *全局作用域*：*全局块*对应的作用域。这里的变量可以在任何地方访问到；
* *domain作用域*：*domain块*对应的作用域。
* *location作用域*：*location块*对应的作用域。
* *request作用域*：隐式作用域，不对应具体的代码块，这些作用域中的指令，可以分布在任何代码块中。
* *response作用域*：隐式作用域，不对应具体的代码块，这些作用域中的指令，可以分布在任何代码块中。

## 代码块层级关系

```
global
    |- domain
        |- location
        |- location
        |- ...
    |- domain
        |- location
        |- location
        |- ...
```

## 变量查找

当前作用域中查找变量的规则为：

1. 如果当前作用域有这个变量，*返回* 这个变量的值。
2. 查找上一级作用域，如果上一级作用域中有这个变量，*返回* 这个变量的值。
3. 否则，如果上一级作用域是全局作用域，*返回* 变量名称（包括`$`符号\)。
4. 重复步骤*[2-3]*。

## 指令执行

代码块中的指令在对应的时机（request／response）会自动执行，此外，还会执行上一级代码块中的指令，比如：

```bash
www1.test.com => {
    # 1    
    proxy_set_header Host www.test.com;

    location / {
        # 2
        proxy_pass http://52.88.88.88/;
    }

    location /index.html {
        # 3
        proxy_pass http://127.0.0.1:8800/girl/view/index.html;
    }

    location ~ /\/(native|gallery|picture|font)\/(.*)/ {
        # 4
        proxy_pass http://88.88.88.88/$1/$2;
    }
}
```

上面的配置中，在执行\#2、\#3和\#4处的指令同时，都会执行配置在\#1处的指令，也就是说: 

`/`、`/index.html`和`/\/(native|gallery|picture|font)\/(.*)/`对应的请求，都会加上请求头部`Host`，值为`www.test.com`


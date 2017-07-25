# Find Config file

> 如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！
> 
> If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

如果是遵循的理念的存放配置文件（包括配置文件的文件名），当hiproxy的启动时，能够自动查找项目的配置文件，不需要手动指定配置文件。

如果没有遵循，把配置文件存放在其他路径或者不是使用默认的文件名称（hosts文件默认文件名称为`hosts`，rewrite文件默认的文件名称为`rewrite`），需要在启动的时候，手动指定配置文件名称。

## 指定配置文件

要指定配置文件名称，可以使用选项`-c, --hosts-file <files>`和`-r, --rewrite-file <files>`。

`-c, --hosts-file <files>`用来指定hosts的文件路径，多个文件使用`,`分隔。

`-r, --rewrite-file <files>`用来指定rewrite的文件路径，多个文件使用`,`分隔。

`<files>`也支持使用**简单的通配符模式**来指定多个文件，比如`--rewrite-file ./*/*.conf`。

> **注意**
>
> 如果指定了对应的配置文件，hiproxy会查找指定的文件，不再查找默认的`hosts`或者`rewrite`，比如：
> * 指定了`-c ./*/hosts.conf`，则不再查找名称为`hosts`的文件。
> * 指定了`-r ./*/rewrite.conf`，则不再查找名称为`rewrite`的文件。

## 配置文件名称通配符

支持的通配符有：

通配符 | 说明 | 示例 | 匹配 | 不匹配
---------|----------|---------|----------|---------
 \* | 匹配一个或者多个字符 | ./test-*.js | ./test-hello.js | ./test-.js
 ? | 匹配一个字符 | ./test?.js | ./testA.js | ./testAB.js
 [abc] | 匹配方括号的中任意字符。 | ./test[ABC].js | ./testA.js | ./testD.js
 [^abc] | 匹配非方括号的中任意字符。 | ./test[^ABC].js | ./testD.js | ./testA.js
 [!abc] | 同[^abc] | ./test[!ABC].js | ./testD.js | ./testA.js

> **注意**
> 
> 不支持使用`**`来查找任意层级目录中的文件。

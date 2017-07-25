# Applied to existing projects 运用到现有项目中

> 如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！
>
> If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

## 全局安装hiproxy

如果你还没有安装[hiproxy](https://github.com/hiproxy/hiproxy)，请查看[如何安装](installation.md)hiproxy。

我们只需要把hiproxy安装到全局就可以了，**不需要将hiproxy作为一个依赖安装到每个项目中**。

## 添加配置文件

hiproxy的两个理念：

* 所有的项目都放到一个工作空间（workspace）下面；
* 将配置文件（hosts／rewrite配置）放到对应的项目中，提交带代码仓库里面进行版本控制，与团队中其他成员共享。

所以，我们需要把配置文件存放到对应的项目中。针对不同的项目，可以添加不同的配置文件。hiproxy在启动的时候，会自动从工作目录下面查找配置文件。

推荐的工作空间目录结构如下：

```
workspace
  ├── app-1 # 项目1
  │   ├── hosts   # hosts文件
  │   ├── rewrite # rewrite文件
  │   └── src     # 项目代码
  │   └── ...     # 其他文件
  │
  ├── app-2 # 项目2
  │   ├── hosts   # hosts文件
  │   ├── rewrite # rewrite文件
  │   └── src     # 项目代码
  │   └── ...     # 其他文件
  │
  └── app-3 # 项目3
      ├── hosts   # hosts文件
      ├── rewrite # rewrite文件
      └── src     # 项目代码
      └── ...     # 其他文件
```

当然，如果你实在是不希望这样去做，想把所有的配置都放到项目之外，你也可以通过启动时添加选项（option）来制定配置文件路径：

```
-c, --hosts-file <files>   hosts files, format: <file1>[,<file2>[,...]]
-r, --rewrite-file <files> rewrite config files, format: <file1>[,<file2>[,...]]
```

> **提示**：
>
> * `-c, --hosts-file`和`-r, --rewrite-file`支持**简化版的模式匹配**；比如：`./*/*.conf`；
> * 支持的语法：`*`, `?`, `[abc]`, `[a-z]`, `[^a-z]`, `[!a-z]`；
> * 不支持的语法：`**`。

### hosts

[hosts](../configuration/hosts.md)跟系统hosts类似，只不过这个hosts是放到项目中的，如果我们在项目根目录下面创建了hosts文件并且文件名称为`hosts`，hiproxy能自动发现并解析它。

如果文件名称不是`hosts`，则需要我们通过`-c, --hosts-file`来指定。

### rewrite

[rewrite](../configuration/rewrite.md)跟hosts一样，也是放到项目中的，如果我们在项目根目录下面创建了名称为`rewrite`的文件，hiproxy也能自动发现并解析它。

如果文件名称不是`rewrite`，则需要我们通过`-r, --rewrite-file`来指定。

## 提交git

hiproxy希望大家能把上面添加的hosts/rewrite配置文件提交到git中，这样团队中的成员更新代码之后，就能使用这些配置，免去了互相拷贝配置文件的苦恼。

## 启动服务

hiproxy的理念是基于**工作空间**。我们需要在工作空间下启动hiproxy代理服务。假设我们所有的项目都存放在`~/workspace/`，那么这么目录就是我们的工作空间。

当我们进入到这个目录，然后启动hiproxy代理服务，那么hiproxy将查找这个目录下面所有项目的配置文件。

如果你不希望进入工作空间再启动代理服务，也可以在任意目录启动hiproxy并使用选项`-w, --workspace <workspace>`，比如：

```bash
# 进入到任意目录
hiproxy start -w ~/workspace/
```

**提示**：在启动hiproxy代理服务的时候，建议使用`-o, --open [browser-name]`来打开一个浏览器窗口并自动配置好代理。这样就不需要我们自己手动去配置代理。

## 开发调试

启动hiproxy代理服务之后，打开的浏览器窗口里面的所有请求，如果配置了代理规则，都会交给hirpoxy去处理。

不需要配置系统hosts。

# Introduction

> 如果你愿意帮助hiproxy编写文档，请联系zdying@live.com, 谢谢！
>
> If you are willing to help hiproxy to write documentation, please contact zdying@live.com, thank you!

## 配置文件类型

hiproxy可以使用hosts来做简单的请求代理，对于复杂的配置使用跟Nginx语法类似的rewrite规则配置。

### hosts

跟系统`hosts`语法一致，此外也支持端口号。hosts只能配置域名对应的ip和端口号，不支持详细的路由配置以及对请求响应做修改。更多详细信息请查看[hosts](../configuration/hosts.md)。

### hosts配置示例

```bash
# comment
127.0.0.1 example.com

# ip + port
127.0.0.1:8800 blog.example.com life.example.com
```

### rewrite

rewrite规则配置文件，可以使用更复杂的配置、满足复杂的使用场景。可以对路由进行详细的配置以及对请求响应做修改。rewrite配置的语法，跟Nginx语法非常类似。更多详细信息请查看[rewrite](../configuration/rewrite.md)。

### rewrite配置示例

```bash
# 全局变量
set $port 8899;
set $ip   127.0.0.1;
set $online 210.0.0.0;

# 域名配置
domain example.com {
  location / {
    proxy_pass http://$online/;
  }

  location /blog/ {
    proxy_pass http://$ip:$port/blog/;
    proxy_set_header from 'hiproxy';
    set_header proxy 'hiproxy';
  }
}
```

## 配置文件位置

hiproxy推荐把配置文件存放在具体的**项目根目录**（hosts文件名称为`hosts`，rewrite配置文件名称为`rewrite`），项目位于工作空间中，也就是类似如下结构：

```bash
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

这样的好处在于，这些配置文件可以提交代码仓库，团队成员共享，节约维护成本。hiproxy也能自动查找这些文件。

## 配置文件查找

如果是遵循上面的规则存放配置文件（包括配置文件的文件名），当hiproxy的工作空间为`workspace`目录时，能够自动查找到上面三个项目的配置文件，不需要手动指定配置文件。

如果没有遵循上面的规则，把配置文件存放在其他路径或者不是使用默认的文件名称（hosts文件默认文件名称为`hosts`，rewrite文件默认的文件名称为`rewrite`），需要在启动的时候，手动指定配置文件名称。

详情请查看[配置文件查找](./find_conf.md)。

## 配置文件更新

...

## 代理规则合并

...

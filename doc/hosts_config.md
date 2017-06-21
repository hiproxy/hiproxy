# Hosts

hiproxy 支持项目`hosts`文件，这是一个增强版的`hosts` - **支持端口**，位于项目根目录，启动代理服务时，会读取并解析这个文件，代理服务器接收到请求时，会根据这个`hosts`文件做相应请求的转发。

使用项目`hosts`文件，不会有系统自带`hosts`的缓存问题。修改项目`hosts`文件后，不需要重启hiproxy，hiproxy会自动自动更新`hosts`规则。

## 语法 

语法跟系统`hosts`语法基本一致，唯一不一样的地方就是，hiproxy的`hosts`支持**IP+端口**，语法如下:

```
IP[:端口] 域名1 域名2 域名3 ... 域名N
```

## 例子 

```bash
# custom hosts with port :)

# comment
# 127.0.0.1 hiproxy.com
# 127.0.0.1:8800 hiproxy.com
# 127.0.0.1:8800 hiproxy.com hii.com

127.0.0.1:8800 hiproxy.com hi.com
127.0.0.1 example.com example.com.cn
```

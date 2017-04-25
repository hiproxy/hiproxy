# hiproxy
A Node.js proxy client

[![Build Status](https://travis-ci.org/zdying/hiproxy.svg?branch=master)](https://travis-ci.org/zdying/hiproxy)
[![Coverage Status](https://coveralls.io/repos/github/zdying/hiproxy/badge.svg?branch=master)](https://coveralls.io/github/zdying/hiproxy?branch=master)
[![npm](https://img.shields.io/npm/v/hiproxy.svg)](https://www.npmjs.com/package/hiproxy)
[![Node.js version](https://img.shields.io/badge/node-%3E%3D0.12.7-orange.svg)](https://nodejs.org/)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/zdying/hiproxy/blob/master/LICENSE)

# 安装

```bash
npm install -g hiproxy
```

# 使用

1. 启动服务
```bash
cd your_workspace
hiproxy start -p 5525 --debug
```

2. 设置代理

```bash
127.0.0.1:5525
```

# API

<a name="ProxyServer"></a>

## ProxyServer
**Kind**: global class  

* [ProxyServer](#ProxyServer)
    * [new ProxyServer(httpPort, httpsPort)](#new_ProxyServer_new)
    * [.start(httpPort, httpsPort)](#ProxyServer+start) ⇒ <code>Promise</code>
    * [.stop()](#ProxyServer+stop) ⇒ <code>[ProxyServer](#ProxyServer)</code>
    * [.restart()](#ProxyServer+restart) ⇒ <code>[ProxyServer](#ProxyServer)</code>
    * [.addHostsFile(filePath)](#ProxyServer+addHostsFile) ⇒ <code>[ProxyServer](#ProxyServer)</code>
    * [.addRewriteFile(filePath)](#ProxyServer+addRewriteFile) ⇒ <code>[ProxyServer](#ProxyServer)</code>
    * [.openBrowser(browserName, url, [usePacProxy])](#ProxyServer+openBrowser) ⇒ <code>[ProxyServer](#ProxyServer)</code>
    * [.findConfigFiels([dir])](#ProxyServer+findConfigFiels) ⇒ <code>[ProxyServer](#ProxyServer)</code>

<a name="new_ProxyServer_new"></a>

### new ProxyServer(httpPort, httpsPort)
hiproxy代理服务器


| Param | Type | Description |
| --- | --- | --- |
| httpPort | <code>Number</code> | http代理服务端口号 |
| httpsPort | <code>Number</code> | https代理服务器端口号 |

<a name="ProxyServer+start"></a>

### proxyServer.start(httpPort, httpsPort) ⇒ <code>Promise</code>
启动代理服务

**Kind**: instance method of <code>[ProxyServer](#ProxyServer)</code>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| httpPort | <code>Number</code> | http服务端口号 |
| httpsPort | <code>Number</code> | https服务端口号 |

<a name="ProxyServer+stop"></a>

### proxyServer.stop() ⇒ <code>[ProxyServer](#ProxyServer)</code>
停止代理服务

**Kind**: instance method of <code>[ProxyServer](#ProxyServer)</code>  
**Access**: public  
<a name="ProxyServer+restart"></a>

### proxyServer.restart() ⇒ <code>[ProxyServer](#ProxyServer)</code>
重启代理服务

**Kind**: instance method of <code>[ProxyServer](#ProxyServer)</code>  
**Access**: public  
<a name="ProxyServer+addHostsFile"></a>

### proxyServer.addHostsFile(filePath) ⇒ <code>[ProxyServer](#ProxyServer)</code>
添加Hosts文件

**Kind**: instance method of <code>[ProxyServer](#ProxyServer)</code>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>String</code> \| <code>Array</code> | `hosts`文件路径（绝对路径） |

<a name="ProxyServer+addRewriteFile"></a>

### proxyServer.addRewriteFile(filePath) ⇒ <code>[ProxyServer](#ProxyServer)</code>
添加rewrite文件

**Kind**: instance method of <code>[ProxyServer](#ProxyServer)</code>  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>String</code> \| <code>Array</code> | `rewrite`文件路径（绝对路径） |

<a name="ProxyServer+openBrowser"></a>

### proxyServer.openBrowser(browserName, url, [usePacProxy]) ⇒ <code>[ProxyServer](#ProxyServer)</code>
打开浏览器窗口

**Kind**: instance method of <code>[ProxyServer](#ProxyServer)</code>  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| browserName | <code>String</code> |  | 浏览器名称 |
| url | <code>String</code> |  | 要打开的url |
| [usePacProxy] | <code>Boolean</code> | <code>false</code> | 是否使用自动代理 |

<a name="ProxyServer+findConfigFiels"></a>

### proxyServer.findConfigFiels([dir]) ⇒ <code>[ProxyServer](#ProxyServer)</code>
在指定工作空间（目录）下查找配置文件
hiproxy会在指定的空间下所有一级目录下查找配置文件

**Kind**: instance method of <code>[ProxyServer](#ProxyServer)</code>  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [dir] | <code>String</code> | <code>process.cwd()</code> | 工作空间（目录） |


# Events

## start
## request
## httpsRequest
## connect
## setRequestOption
## setResponse
## response
## close
## addHostsFile
## addRewriteFile
## createPacFile

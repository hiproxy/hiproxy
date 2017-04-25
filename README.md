# hiproxy
A Node.js proxy client

[![Build Status](https://travis-ci.org/zdying/hiproxy.svg?branch=master)](https://travis-ci.org/zdying/hiproxy)
[![Coverage Status](https://coveralls.io/repos/github/zdying/hiproxy/badge.svg?branch=master)](https://coveralls.io/github/zdying/hiproxy?branch=master)
[![npm](https://img.shields.io/npm/v/hiproxy.svg)](https://www.npmjs.com/package/hiproxy)
[![Node.js version](https://img.shields.io/badge/node-%3E%3D0.12.7-orange.svg)](https://nodejs.org/)
[![license](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com/zdying/hiproxy/blob/master/LICENSE)

# Install

```bash
npm install -g hiproxy
```

# Usage

1. Start proxy server
```bash
cd your_workspace
hiproxy start -p 5525 --debug
```

2. Config proxy

```bash
127.0.0.1:5525
```

# API

<a name="ProxyServer"></a>

## ProxyServer ⇐ <code>EventEmitter</code>
**Kind**: global class  
**Extends**: <code>EventEmitter</code>  

* [ProxyServer](#ProxyServer) ⇐ <code>EventEmitter</code>
    * [new ProxyServer(httpPort, httpsPort)](#new_ProxyServer_new)
    * [.start(httpPort, httpsPort)](#ProxyServer+start) ⇒ <code>Promise</code>
    * [.stop()](#ProxyServer+stop) ⇒ [<code>ProxyServer</code>](#ProxyServer)
    * [.restart()](#ProxyServer+restart) ⇒ [<code>ProxyServer</code>](#ProxyServer)
    * [.addHostsFile(filePath)](#ProxyServer+addHostsFile) ⇒ [<code>ProxyServer</code>](#ProxyServer)
    * [.addRewriteFile(filePath)](#ProxyServer+addRewriteFile) ⇒ [<code>ProxyServer</code>](#ProxyServer)
    * [.openBrowser(browserName, url, [usePacProxy])](#ProxyServer+openBrowser) ⇒ [<code>ProxyServer</code>](#ProxyServer)
    * [.findConfigFiels([dir])](#ProxyServer+findConfigFiels) ⇒ [<code>ProxyServer</code>](#ProxyServer)

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

**Kind**: instance method of [<code>ProxyServer</code>](#ProxyServer)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| httpPort | <code>Number</code> | http服务端口号 |
| httpsPort | <code>Number</code> | https服务端口号 |

<a name="ProxyServer+stop"></a>

### proxyServer.stop() ⇒ [<code>ProxyServer</code>](#ProxyServer)
停止代理服务

**Kind**: instance method of [<code>ProxyServer</code>](#ProxyServer)  
**Access**: public  
<a name="ProxyServer+restart"></a>

### proxyServer.restart() ⇒ [<code>ProxyServer</code>](#ProxyServer)
重启代理服务

**Kind**: instance method of [<code>ProxyServer</code>](#ProxyServer)  
**Access**: public  
<a name="ProxyServer+addHostsFile"></a>

### proxyServer.addHostsFile(filePath) ⇒ [<code>ProxyServer</code>](#ProxyServer)
添加Hosts文件

**Kind**: instance method of [<code>ProxyServer</code>](#ProxyServer)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>String</code> \| <code>Array</code> | `hosts`文件路径（绝对路径） |

<a name="ProxyServer+addRewriteFile"></a>

### proxyServer.addRewriteFile(filePath) ⇒ [<code>ProxyServer</code>](#ProxyServer)
添加rewrite文件

**Kind**: instance method of [<code>ProxyServer</code>](#ProxyServer)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| filePath | <code>String</code> \| <code>Array</code> | `rewrite`文件路径（绝对路径） |

<a name="ProxyServer+openBrowser"></a>

### proxyServer.openBrowser(browserName, url, [usePacProxy]) ⇒ [<code>ProxyServer</code>](#ProxyServer)
打开浏览器窗口

**Kind**: instance method of [<code>ProxyServer</code>](#ProxyServer)  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| browserName | <code>String</code> |  | 浏览器名称 |
| url | <code>String</code> |  | 要打开的url |
| [usePacProxy] | <code>Boolean</code> | <code>false</code> | 是否使用自动代理 |

<a name="ProxyServer+findConfigFiels"></a>

### proxyServer.findConfigFiels([dir]) ⇒ [<code>ProxyServer</code>](#ProxyServer)
在指定工作空间（目录）下查找配置文件
hiproxy会在指定的空间下所有一级目录下查找配置文件

**Kind**: instance method of [<code>ProxyServer</code>](#ProxyServer)  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [dir] | <code>String</code> | <code>process.cwd()</code> | 工作空间（目录） |

<a name="Events"></a>

## Events

* ["start"](#ProxyServer+event_start)
* ["stop"](#ProxyServer+event_stop)
* ["addHostsFile"](#ProxyServer+event_addHostsFile)
* ["addRewriteFile"](#ProxyServer+event_addRewriteFile)
* ["creatPacFile"](#ProxyServer+event_creatPacFile)
* ["httpsRequest"](#ProxyServer+event_httpsRequest)
* ["connect"](#ProxyServer+event_connect)
* ["setResponse"](#ProxyServer+event_setResponse)
* ["request"](#ProxyServer+event_request)
* ["getProxyInfo"](#ProxyServer+event_getProxyInfo)
* ["setRequest"](#ProxyServer+event_setRequest)
* ["setResponse"](#ProxyServer+event_setResponse)
* ["data"](#ProxyServer+event_data)
* ["data"](#ProxyServer+event_data)
* ["data"](#ProxyServer+event_data)
* ["response"](#ProxyServer+event_response)

<a name="ProxyServer+event_start"></a>

### "start"
Emitted when the hiproxy server(s) start.

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| servers | <code>Array</code> | http/https server |
| localIP | <code>String</code> | the local ip address |

<a name="ProxyServer+event_stop"></a>

### "stop"
Emitted when the hiproxy server(s) stop.

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
<a name="ProxyServer+event_addHostsFile"></a>

### "addHostsFile"
Emitted when add hosts file.

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| filePath | <code>Array</code> \| <code>String</code> | rewrite file path(s) |

<a name="ProxyServer+event_addRewriteFile"></a>

### "addRewriteFile"
Emitted when add rewrite file.

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| filePath | <code>Array</code> \| <code>String</code> | rewrite file path(s) |

<a name="ProxyServer+event_creatPacFile"></a>

### "creatPacFile"
Emitter when the `pac` proxy file is created or updated.

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| domains | <code>Object</code> | domain list |

<a name="ProxyServer+event_httpsRequest"></a>

### "httpsRequest"
Emitted each time there is a request to the https server.

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| request | <code>http.IncomingMessage</code> | request object |
| response | <code>http.ServerResponse</code> | response object |

<a name="ProxyServer+event_connect"></a>

### "connect"
Emitted each time the server responds to a request with a `CONNECT` method.

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| request | <code>http.IncomingMessage</code> | request object |
| socket | <code>net.Socket</code> | socket object |
| head | <code>Buffer</code> | head |

<a name="ProxyServer+event_setResponse"></a>

### "setResponse"
Emitted each time the server set response info (eg: headers).

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| response | <code>http.ServerResponse</code> | request object |

<a name="ProxyServer+event_request"></a>

### "request"
Emitted each time there is a request.

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| request | <code>http.IncomingMessage</code> | request object |
| response | <code>http.ServerResponse</code> | response object |

<a name="ProxyServer+event_getProxyInfo"></a>

### "getProxyInfo"
Emitted each time the hiproxy server get proxy info for current request.

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| proxyInfo | <code>Object</code> | proxy info object |

<a name="ProxyServer+event_setRequest"></a>

### "setRequest"
Emitted each time the hiproxy server set request options (eg: headers and host) before request data from remote server

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| request | <code>http.IncomingMessage</code> | request |
| proxyOptions | <code>Object</code> | the proxy header options |

<a name="ProxyServer+event_setResponse"></a>

### "setResponse"
Emitted each time the server set response info (eg: headers).

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| response | <code>http.ServerResponse</code> | request object |

<a name="ProxyServer+event_data"></a>

### "data"
Emitted whenever the response stream received some chunk of data.

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| data | <code>Buffer</code> | response data |

<a name="ProxyServer+event_data"></a>

### "data"
Emitted whenever the response stream received some chunk of data.

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| data | <code>Buffer</code> | response data |

<a name="ProxyServer+event_data"></a>

### "data"
Emitted whenever the response stream received some chunk of data.

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| data | <code>Buffer</code> | response data |

<a name="ProxyServer+event_response"></a>

### "response"
Emitted when a response is end. This event is emitted only once.

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| response | <code>http.ServerResponse</code> | response object |

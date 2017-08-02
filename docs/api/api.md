# Node.js API

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
    * [.findConfigFiles([dir])](#ProxyServer+findConfigFiles) ⇒ [<code>ProxyServer</code>](#ProxyServer)

<a name="new_ProxyServer_new"></a>

### new ProxyServer(httpPort, httpsPort)
hiproxy代理服务器


| Param | Type | Description |
| --- | --- | --- |
| httpPort | <code>Number</code> | http代理服务端口号 |
| httpsPort | <code>Number</code> | https代理服务器端口号 |

<a name="ProxyServer+start"></a>

### proxyServer.start([config]) ⇒ <code>Promise</code>
启动代理服务

**Kind**: instance method of [<code>ProxyServer</code>](#ProxyServer)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | 配置字段 |

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

<a name="ProxyServer+findConfigFiles"></a>

### proxyServer.findConfigFiles([dir]) ⇒ [<code>ProxyServer</code>](#ProxyServer)
在指定工作空间（目录）下查找配置文件
hiproxy会在指定的空间下所有一级目录下查找配置文件

**Kind**: instance method of [<code>ProxyServer</code>](#ProxyServer)  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [dir] | <code>String</code> | <code>process.cwd()</code> | 工作空间（目录） |
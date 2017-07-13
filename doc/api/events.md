# Events

## ProxyServer ⇐ <code>EventEmitter</code>
**Kind**: global class  
**Extends**: <code>EventEmitter</code>  

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

### "response"
Emitted when a response is end. This event is emitted only once.

**Kind**: event emitted by [<code>ProxyServer</code>](#ProxyServer)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| response | <code>http.ServerResponse</code> | response object |
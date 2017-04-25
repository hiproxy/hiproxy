var fs = require('fs');
var os = require('os');
var path = require('path');

var aliasWorker = require('./workers/alias');
var requestWorker = require('./workers/request');
var getProxyInfo = require('../../tools/getProxyInfo');

module.exports = function requestHandler(request, response){
    var _url = request.url;
    var start = Date.now();

    /**
     * the request event
     * @event ProxyServer#request
     * @property {http.IncomingMessage} request request object
     * @property {http.ServerResponse} response response object
     */
    this.emit('request', request, response);

    if(_url === '/'){
        var pacURL = 'http://127.0.0.1:' + this.httpPort + '/proxy.pac';
        var localIP = this.localIP;
        var httpPort = this.httpPort;
        var httpsPort = this.httpsPort;

        response.write('<style>.red{color: #DC544B} .label{color: #10a3ca; font-weight: bold}</style>');
        // response.write('<h1>hiproxy server</h1>');
        response.write([
            '<pre>',
            " _     <span class=\"red\">_</span>  ",
            "| |   <span class=\"red\">(_)</span> ",
            "| |__  _    <span class=\"label\">Proxy address:</span> " + localIP + ":" + httpPort,
            "| '_ \\| |   <span class=\"label\">Https address:</span> " + (httpsPort ? localIP + ":" + httpsPort : "disabled"),
            "| | | | |   <span class=\"label\">Proxy file at:</span> <a href=\"" + pacURL + "\">" + pacURL + "</a>",
            "|_| |_|_| ",
            '</pre>'
        ].join('\n'));
        response.end();
        return
    }

    if(_url === '/proxy.pac'){
        var pacFilePath = path.resolve(os.tmpdir(), 'proxy.pac');

        fs.readFile(pacFilePath, 'utf-8', function(err, str){
            response.end(str);
        });
        return
    }

    if(_url === '/favicon.ico'){
        response.end('');
        return;
    }

    request._startTime = start;

    setRequest.call(this, request);

    var rewrite_rule = request.rewrite_rule;

    log.detail('proxy request options:', request.url, '==>', JSON.stringify(request.proxy_options));

    // 重定向到本地文件系统
    if(request.alias){
        return aliasWorker.response.call(this, rewrite_rule, request, response);
    }

    return requestWorker.response.call(this, rewrite_rule, request, response);
};

function setRequest(request){
    var proxyInfo = getProxyInfo.call(
        this,
        request,
        this.hosts.getHost(),
        this.rewrite.getRule()
    );

    request.proxy_options = proxyInfo.proxy_options;
    request.hosts_rule = proxyInfo.hosts_rule;
    request.rewrite_rule = proxyInfo.rewrite_rule;
    request.PROXY = proxyInfo.PROXY;
    request.alias = proxyInfo.alias;
    request.newUrl = proxyInfo.newUrl;

    /**
     * the setRequestOption event
     * @event ProxyServer#setRequestOption
     * @property {Object} proxyOptions the proxy header options
     */
    this.emit('setRequestOption', request.proxy_options);

    return request;
}
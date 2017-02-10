var aliasWorker = require('./workers/alias');
var requestWorker = require('./workers/request');
var getProxyInfo = require('../../tools/getProxyInfo');

module.exports = function requestHandler(request, response){
    var _url = request.url;
    var start = Date.now();

    if(_url === '/'){
        response.end('proxy file url: http://127.0.0.1:' + this.httpPort + '/proxy.pac');
        return
    }

    if(_url === '/proxy.pac'){
        var pacFilePath = path.resolve(os.tmpdir(), 'hiipack.pac');

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
        return aliasWorker.response(rewrite_rule, request, response);
    }

    return requestWorker.response(rewrite_rule, request, response);
};

function setRequest(request){
    var proxyInfo = getProxyInfo(
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

    return request;
}
/**
 * @file Proxy Server
 * @author zdying
 */

var http = require('http');
var path = require('path');
var net = require('net');
var url = require('url');
var fs = require('fs');


var Hosts = require('./hosts');
var Rewrite = require('./rewrite');

var browser = require('./browser');

var createServer = require('./tools/createServer');

var listeners = require('./listeners');

var findHostsAndRewrite = require('./tools/findHostsAndRewrite');

function ProxyServer(httpPort, httpsPort){
    this.hosts = new Hosts();
    this.rewrite = new Rewrite();

    this.httpPort = httpPort;
    this.httpServer = null;

    this.httpsPort = httpsPort;
    this.httpsServer = null;
}

ProxyServer.prototype = {
    constructor: ProxyServer,

    /**
     * 配置服务器信息
     * 
     * @param {Object} settings
     * @param {Object} [settings.log]
     * @param {Object} [settings.httpPort]
     * @param {Object} [settings.httpsPort]
     * @param {Object} [settings.rewriteExt]
     */
    setUp: function(settings){

    },

    /**
     * 启动代理服务
     * 
     * @param {Number} httpPort http服务端口号
     * @param {Number} httpsPort https服务端口号
     */
    start: function(httpPort, httpsPort){
        var self = this;
        var servers = [
            createServer.create(httpPort || this.httpPort, false, this.rewrite)
        ];

        if(httpsPort || this.httpsPort){
            servers.push(createServer.create(httpsPort || this.httpsPort, true, this.rewrite))
        }

        return Promise.all(servers)
            .then(function(servers){
                var httpServer = servers[0];
                var httpsServer = servers[1];

                self.httpServer = httpServer;
                self.httpsServer = httpsServer;

                setTimeout(function(){
                    _initEvent.call(self);
                    _findFiles.call(self);
                }, 0);

                return servers;
            })
            .catch(function(err){
                log.error(err);
            })
    },

    /**
     * 停止代理服务
     */
    stop: function(){
        
    },

    /**
     * 重启代理服务
     */
    restart: function(){

    },

    /**
     * 添加Hosts文件
     * 
     * @param {String|Array} filePath
     */
    addHostsFile: function(filePath){
        this.hosts.addFile(filePath)
    },

    /**
     * 添加rewrite文件
     * 
     * @param {String|Array} filePath
     */
    addRewriteFile: function(filePath){
        this.rewrite.addFile(filePath)
    },

    /**
     * 添加指令
     * 
     * @param {String} name  指令名称
     * @param {String} scope 指令作用域
     * @param {Function} fn  指令执行函数
     */
    addDirective: function(name, scope, fn){

    },
 
    /**
     * 打开浏览器窗口
     * 
     * @param {String} browserName 浏览器名称
     * @param {String} url         要打开的url
     */
    openBrowser: function(browserName, url){
        browser.open(browserName, url, 'http://127.0.0.1:' + this.httpPort);
    }
};

function _initEvent(){
    var port = this.httpPort;
    var url = 'http://127.0.0.1:' + port;
    var pac = url + '/proxy.pac';
    var server = this.httpServer;
    var httpsServer = this.httpsServer;

    server
        .on('request', listeners.request.bind(this))
        .on('connect', listeners.connect.bind(this));

    httpsServer && httpsServer
        .on('request', function(req, res){
            var url = req.url;
            var host = req.headers.host;
            var protocol = req.client.encrypted ? 'https' : 'http';

            log.debug('http middle man _server receive request ==>', protocol, host, url);

            if(!url.match(/^\w+:\/\//)){
                req.url = protocol + '://' + host + url;
            }

            if(host === '127.0.0.1:' + this.httpsPort){
                res.end('the man in the middle page: ' + url);
                // if(url === '/'){
                //     res.end('the man in the middle.');
                // }else if(url === '/favicon.ico'){
                //     res.statusCode = 404;
                //     res.end('404 Not Found.');
                // }else{
                //     res.statusCode = 404;
                //     res.end('404 Not Found.');
                // }
            }else{
                listeners.request.call(this, req, res);
            }
        }.bind(this));

    return this;
}

function _findFiles(){
    var self = this;

    findHostsAndRewrite(function(err, hosts, rewrites){
        if(err){
            return log.error(err);
        }

        log.debug('findHostsAndRewrite - hosts [', hosts.join(', ').bold.green, ']');
        log.debug('findHostsAndRewrite - rewrites [', (rewrites.join(', ')).bold.green, ']');

        // 将找到的Hosts文件解析并加入缓存
        self.addHostsFile(hosts);

        // 将找到的rewrite文件解析并加入缓存
        self.addRewriteFile(rewrites)
    })
}

module.exports = ProxyServer;
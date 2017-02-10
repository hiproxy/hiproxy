/**
 * @file 代理请求转发到其他服务器
 * @author zdying
 */

'use strict';

var logger = log.namespace('proxy -> Server');

var execResponseCommand = require('../../../tools/execCommand');

module.exports = {
    response: function(rewrite_rule, request, response){
        var url = require('url');
        var http = require('http');
        var https = require('https');
        var zlib = require('zlib');

        var proxyOption = request.proxy_options;
        var isHTTPS = proxyOption.protocol === 'https:';

        proxyOption.headers['accept-encoding'] = 'gzip,deflate';

        if(isHTTPS){
            // proxyOption.port = 443;
            proxyOption.rejectUnauthorized = false;
        }

        var proxy = (isHTTPS ? https : http).request(proxyOption, function(res){
            response.headers = res.headers;

            var encoding = response.headers['content-encoding'];
            // response.removeHeader('Content-Encoding');
            // delete response.headers['content-encoding'];

            execResponseCommand(rewrite_rule, {
                response: response
            }, 'response');

            // response.pipe(res);
            response.writeHead(res.statusCode, res.headers);

            /*
            res.pause();

            log.warn('request was paused:'.red, _url.bold.red);

            setTimeout(function(){
                res.resume();                
                log.warn('request was resumed:'.red, _url.bold.red);
            }, 5000)
            */

            var contentType = res.headers['content-type'];

            if(global.program && global.program.proxyContentLog && /(text|json|javascript|css)/.test(contentType)){
                // 打印日志
                if(encoding === 'gzip' || encoding === 'deflate'){
                    var unzipStream = zlib.createUnzip();

                    unzipStream.on('data', function(chunk){
                        console.log('ondata =>', chunk.toString());
                    });

                    unzipStream.on('error', function(err){
                        console.log('error ==>', err);
                    });

                    res.pipe(unzipStream);
                }else{
                    res.on('data', function(chunk){
                        console.log('ondata =>', chunk.toString());
                    })
                }
            }

            res.pipe(response);

            res.on('end', function(){
                request.res = res;

                if(request.PROXY){
                    logger.access(request, (proxyOption.protocol || 'http:') + '//' + proxyOption.hostname +
                        (proxyOption.port ? ':' + proxyOption.port : '') + proxyOption.path)
                }else{
                    logger.access(request);
                    // logger.info('direc -', request.url.bold, Date.now() - start, 'ms');
                }
            });
        });

        proxy.on('error', function(e){
            if(e.code === 'ENOTFOUND'){
                response.statusCode = 404;
                response.end();
            }else{
                logger.error('proxy error:', request.url);
                logger.detail(e.stack);
                response.statusCode = 500;
                response.end(e.stack);
            }
            request.res = response;
            log.access(request)
        });

        request.pipe(proxy);
    }
};
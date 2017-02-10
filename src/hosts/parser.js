/**
 * @file parse hosts file to javascript object
 * @author zdying
 */
var fs = require('fs');

/**
 * parse hosts file to javascript object
 *
 * input:
 *      127.0.0.1:8800 hiipack.com hii.com
 *      127.0.0.1 example.com example.com.cn
 *
 * output:
 *      {
 *           "hiipack.com": "127.0.0.1:8800",
 *           "hii.com": "127.0.0.1:8800",
 *           "example.com": "127.0.0.1",
 *           "example.com.cn": "127.0.0.1"
 *       }
 * @param filePath
 * @returns {{}}
 */
module.exports = function parseHosts(filePath){
    var hostRules = {};

    var hosts = fs.readFileSync(filePath);

    hosts.toString().split(/\n\r?/).forEach(function(line){
        line = line.replace(/#.*$/, '');

        if(line.trim() === ''){
            return
        }

        var arr = line.split(/\s+/);

        if(arr.length < 2 || line.indexOf('/') !== -1){
            setTimeout(function(){
                log.debug('hosts -', line.bold.yellow, 'ignored')
            }, 0)
        }

        for(var i = 1, len = arr.length; i < len; i++){
            hostRules[arr[i]] = arr[0];
        }
    });

    log.debug('hosts - hosts file parsed: ', JSON.stringify(hostRules));

    return hostRules
};
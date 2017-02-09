/**
 * @file 在启动目录下遍历所有一级目录查找hosts文件和rewrite文件
 * @author zdying
 */

var fs = require('fs');

module.exports = function findHostsAndRewrite(callback){
    var cwd = process.cwd();
    var hosts = [];
    var rewrites = [];

    setTimeout(function(){
        log.debug('findHostsAndRewrite - find hosts and rewrite in', cwd.bold.green);
    }, 100);

    fs.readdir(cwd, function(err, files){
        if(err){
            return callback(err)
        }

        files.forEach(function(file){
            var curr = cwd + '/' + file;
            var hostPath, rewritePath;

            if(fs.statSync(curr).isDirectory()){
                hostPath = curr + '/hosts';
                rewritePath = curr + '/rewrite';

                if(fs.existsSync(hostPath)){
                    hosts.push(hostPath)
                }
                if(fs.existsSync(rewritePath)){
                    rewrites.push(rewritePath)
                }
            }
        });

        callback(null, hosts, rewrites);
    })
};
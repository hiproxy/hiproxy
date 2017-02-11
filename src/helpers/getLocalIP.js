/**
 * @file 获取本地IP
 * @author zdying
 */

module.exports = function(){
    return new Promise(function(resolve, reject){
        require('dns').resolve(require('os').hostname(), function(err, addr){
            if(err){
                resolve('127.0.0.1');
            }else{
                var localIP = Array.isArray(addr) ? addr[0] : addr;
                resolve(localIP);
            }
        })
    })
}
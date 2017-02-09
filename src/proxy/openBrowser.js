var detectBrowser = require('./detectBrowser');

module.exports = function openBrowser(browser, url){

        // Firefox pac set
        // http://www.indexdata.com/connector-platform/enginedoc/proxy-auto.html
        // http://kb.mozillazine.org/Network.proxy.autoconfig_url
        // user_pref("network.proxy.autoconfig_url", "http://us2.indexdata.com:9005/id/cf.pac");
        // user_pref("network.proxy.type", 2);

        var browserPath = detectBrowser(browser);

        if(!browserPath){
            log.error('can not find browser', browser.bold.yellow);
        }else{
            var dataDir = __hii__.cacheTmpdir;

            if(os.platform() === 'win32'){
                browserPath = '"' + browserPath + '"';
            }

            var command = browserPath + ' ' + proxyConfig[browser](dataDir, url, browserPath);
            // var command = browserPath + ' --proxy-server="http://127.0.0.1:' + 4936 + '"  --user-data-dir='+ dataDir +'  --lang=local  ' + url;
            log.debug('open ==> ', command);
            require('child_process').exec(command, function(err){
                if(err){
                    console.log(err);
                }
            });
        }
    }
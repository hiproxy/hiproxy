/**
 * @file 浏览器有关的操作
 * @author zdying
 */

var os = require('os');
var path = require('path');
var configUtil = require('./configUtil');

var child_process = require('child_process');

var platform = os.platform();

var browsers = {
  'chrome': {
    darwin: 'com.google.Chrome',
    appName: 'Google Chrome',
    win32: 'chrome.exe'
  },
  'firefox': {
    darwin: 'org.mozilla.firefox',
    appName: 'firefox',
    win32: 'firefox.exe'
  },
  'opera': {
    darwin: 'com.operasoftware.Opera',
    appName: 'Opera',
    win32: 'opera.exe'
  },
  'safari': {
    darwin: 'com.apple.Safari',
    appName: 'Safari',
    win32: 'safari.exe'
  }
};

module.exports = {
  open: function (browser, url, port, usePacProxy) {
        // Firefox pac set
        // http://www.indexdata.com/connector-platform/enginedoc/proxy-auto.html
        // http://kb.mozillazine.org/Network.proxy.autoconfig_url
        // user_pref("network.proxy.autoconfig_url", "http://us2.indexdata.com:9005/id/cf.pac");
        // user_pref("network.proxy.type", 2);

    var browserPath = this.detect(browser);

    if (!browserPath) {
      log.error('can not find browser', browser.bold.yellow);
    } else {
      var dataDir = path.join(os.tmpdir(), 'hiproxy');

      if (os.platform() === 'win32') {
        browserPath = '"' + browserPath + '"';
      }

      var command = browserPath + ' ' + configUtil[browser](dataDir, url, browserPath, port, usePacProxy);
            // var command = browserPath + ' --proxy-server="http://127.0.0.1:' + 4936 + '"  --user-data-dir='+ dataDir +'  --lang=local  ' + url;
      log.debug('open ==> ', command);
      child_process.exec(command, function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
  },

  detect: function (name) {
    var result = '';
    var cmd = '';
    var info = browsers[name];

    if (!info) {
      return '';
    }

    try {
      switch (platform) {
        case 'darwin':
          cmd = 'mdfind "kMDItemCFBundleIdentifier==' + info.darwin + '" | head -1';
          result = child_process.execSync(cmd).toString().trim();
          result += '/Contents/MacOS/' + info.appName;
          result = result.replace(/\s/g, '\\ ');
          break;

        case 'win32':
                    // windows chrome path:
                    // HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe
                    // reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /v Path

          cmd = 'reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\' + info.win32 + '" /ve';
                    // result:
                    /*
                    HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\firefox.exe
                    (默认)    REG_SZ    C:\Program Files\Mozilla Firefox\firefox.exe
                    */

          result = child_process.execSync(cmd).toString().trim();
          result = result.split('\n').pop().split(/\s+REG_SZ\s+/).pop();
          result = result.replace(/^"|"$/g, '');
          break;

        default:
          console.log('default');
          result = name;
      }
    } catch (e) {
      console.log('can not find browser', name);
    }

    return result.trim();
  }
};

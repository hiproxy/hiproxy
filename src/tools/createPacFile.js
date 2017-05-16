/**
 * @file 创建自动代理配置文件
 * @author zdying
 */

'use strict';

var fs = require('fs');
var path = require('path');
var os = require('os');

module.exports = function createPacFile (proxyPort, localIP, domains) {
  if (!domains || Object.keys(domains).length === 0) {
    return Promise.reject(new Error('domain list is empty, can not create `proxy.pac` file.'));
  }
  /** ** 这个方法是生成到proxy.pac中的，hiproxy不会调用 ****/
  // function FindProxyForURL (url, host) {
  //   host = host.toLowerCase();

  //   // alert('host ::: ' + host);
  //   // alert('host in DOMAINS ::: ' + host in DOMAINS);

  //   if (host in DOMAINS) {
  //     // alert('return PROXY: ' + PROXY);
  //     return PROXY;
  //   }

  //   if (!host.match(EXCLUDE_REG) && SYS_PROXY) {
  //     // alert('return SYS_PROXY: ' + SYS_PROXY);
  //     return SYS_PROXY;
  //   } else {
  //     // alert('return DIRECT :::' + DIRECT);
  //     return DIRECT;
  //   }
  // }

  // 系统代理地址，如果设置了系统代理，不在hiipack代理范围内的，走这个代理
  var sysProxy = ''; // config.get('system_proxy');
  // 不需要代理的域名
  var proxyExclude = ''; // config.get('proxy_exclude');

  if (!proxyExclude) {
    proxyExclude = 'localhost,::1,127.0.0.1';
  }

  // 处理proxyExclude中的特殊字符和通配符
  var regText = proxyExclude
    .replace(/\s*,\s*/g, '|')
    .replace(/\./g, '\\.')
    .replace(/\*/g, '.*');

  var txt = [
    'var SYS_PROXY = "' + (sysProxy ? 'PROXY ' + sysProxy : '') + '";\n',
    'var PROXY = "PROXY ' + localIP + ':' + proxyPort + '";\n',
    'var DIRECT = "DIRECT";\n',
    'var EXCLUDE_REG = /' + regText + '/;\n',
    'var DOMAINS = ' + JSON.stringify(domains, null, 4) + ';\n\n',

    'function FindProxyForURL (url, host) {',
    '  host = host.toLowerCase();',

    '  // alert("host ::: " + host);',
    '  // alert("host in DOMAINS ::: " + host in DOMAINS);',

    '  if (host in DOMAINS) {',
    '    // alert("return PROXY: " + PROXY);',
    '    return PROXY;',
    '  }',

    '  if (!host.match(EXCLUDE_REG) && SYS_PROXY) {',
    '    // alert("return SYS_PROXY: " + SYS_PROXY);',
    '    return SYS_PROXY;',
    '  } else {',
    '    // alert("return DIRECT :::" + DIRECT);',
    '    return DIRECT;',
    '  }',
    '}'
  ];

  var pacFilePath = path.resolve(os.homedir(), '.hiproxy', 'proxy.pac');

  return new Promise(function (resolve, reject) {
    fs.writeFile(pacFilePath, txt.join('\n'), function (err) {
      if (err) {
        log.error(err);
        reject(err);
      } else {
        log.debug('Proxy pac file create success: ', pacFilePath);
        resolve(pacFilePath);
      }
    });
  });
};

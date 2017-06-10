/**
 * @file 获取代理相关的信息
 * @author zdying
 */

var url = require('url');

var execCommand = require('../commands/execCommand');
// var replaceVar = require('../rewrite/replaceVar');

/**
 * 获取代理信息, 用于请求代理的地址
 * @param {Object}  request 请求对象
 * @param {Object}  hostsRules 解析后的hosts规则
 * @param {Array}   rewriteRules 解析后的rewrite规则
 * @private
 * @ignore
 * @returns {Object}
 */
module.exports = function getProxyInfo (request, hostsRules, rewriteRules) {
  var originUrl = request.url;
  var uri = url.parse(originUrl);
  var rewrite = !!rewriteRules && getRewriteRule(uri, rewriteRules);
  var host = !!hostsRules && hostsRules[uri.hostname];

  var hostname, port, path, proxyName, protocol;

  protocol = uri.protocol;

  // rewrite 优先级高于 hosts
  if (rewrite && rewrite.props.proxy) {
    var rewriteProps = rewrite.props;
    var proxy = rewriteProps.proxy;
    var isBaseRule = rewrite.isBaseRule;
    var alias = rewriteProps.alias;
    var proxyUrlObj = url.parse(rewriteProps.proxy);
    var protocolReg = /^(\w+:\/\/)/;
    var newUrl, newUrlObj;

    // 如果代理地址中包含具体协议，删除原本url中的协议
    // 最终替换位代理地址的协议
    if (!alias && !isBaseRule && proxyUrlObj.protocol) {
      protocol = proxyUrlObj.protocol;
      originUrl = originUrl.replace(protocolReg, '');
    }

    // TODO 替换其他props中的分组变量`$1`...`$N`, 比如下面的配置
    // location ~ /\/(test|hot)\/(.*)/ {
    //     proxy_set_header Proxy_Server_Source hiipack_regexp_$1;
    //     proxy_pass http://$local/$1/$2?query=$query;
    // }

    // var varSource = {
    //     props: {
    //         $query: uri.query,
    //         $search: uri.search,
    //         $ptah: uri.path
    //     }
    // };
    //
    // proxy = replaceVar(proxy, varSource);

    // 将原本url中的部分替换为代理地址
    if (rewrite.source.indexOf('~') === 0) {
      // 正则表达式
      var sourceReg = null;
      var urlMatch = null;

      if (proxy.match(/\$\d/g)) {
        sourceReg = toRegExp(rewrite.path, 'i');
        urlMatch = request.url.match(sourceReg);

        // 这里可以不用判断urlMath是否为空, 因为getRewriteRule里面已经测试过
        newUrl = proxy.replace(/\$(\d)/g, function (match, groupID) {
          return urlMatch[groupID];
        });
      } else {
        newUrl = proxy;
      }
    } else {
      // 普通地址字符串
      // 否则，把url中的source部分替换成proxy
      newUrl = originUrl.replace(rewrite.source, proxy);
    }

    // TODO 这里应该有个bug, props是共享的, 一个修改了,其他的也修改了
    var context = {
      request: request
      // props: rewrite.props
    };

    execCommand(rewrite, context, 'request');

    log.debug('newURL ==>', newUrl);
    log.debug('newURL ==>', alias);

    if (alias) {
      // 本地文件系统路径, 删除前面的协议部分
      newUrl = newUrl.replace(/^(\w+:\/\/)/, '');
    } else {
      newUrlObj = url.parse(newUrl);

      hostname = newUrlObj.hostname;
      port = newUrlObj.port;
      path = newUrlObj.path;
    }

    proxyName = 'HiProxy';
  } else if (host) {
    hostname = host.split(':')[0];
    port = (protocol === 'https:') ? 443 : Number(uri.port || host.split(':')[1]);
    path = uri.path;
    proxyName = 'HiProxy';
  } else {
    hostname = uri.hostname;
    port = uri.port;
    path = uri.path;
  }

  var proxyInfo = {
    proxy_options: {
      hostname: hostname,
      port: port,
      path: path,
      method: request.method,
      headers: request.headers,
      protocol: protocol
    },
    PROXY: proxyName,
    hosts_rule: host,
    rewrite_rule: rewrite,
    alias: alias,
    newUrl: newUrl
  };

  return proxyInfo;
};

/**
 * 根据url查找对应的rewrite规则
 * @param urlObj
 * @param rewriteRules
 * @param domainCache
 * @returns {*}
 */
function getRewriteRule (urlObj, rewriteRules) {
  var hostname = urlObj.hostname;
  var href = urlObj.href;
  var rewriteRule = null;
  var lastDeep = -1;

  var domains = rewriteRules[hostname];

  if (!domains || !Array.isArray(domains)) {
    return null;
  }

  domains.forEach(function (domain) {
    var rule = domain;
    var location = rule.location;
    var urlPath = urlObj.path;
    var loc = null;
    var currentDeep = 0;
    var locPath = '';

    for (var i = 0, len = location.length; i < len; i++) {
      loc = location[i];

      locPath = loc.path;

      log.debug('getRewriteRule - current location path =>', locPath.bold.green);

      if (locPath.indexOf('~') === 0) {
        /** 正则表达式 **/
        var reg = toRegExp(locPath, 'i');

        if (reg.test(href)) {
          currentDeep = reg.source.replace(/^\\?\/|\\?\/$/, '').split(/\\?\//).length;

          if (currentDeep > lastDeep) {
            rewriteRule = loc;
          }

          log.debug(
            'getRewriteRule -',
            'regexp match =>', locPath.match(reg),
            'deep =>', String(currentDeep).bold.green,
            'last deep =>', String(lastDeep).bold.green,
            'should replace last rule =>', String(currentDeep > lastDeep).bold.green
          );
        }
      } else if (urlPath.indexOf(locPath) === 0) {
        /** 非正则表达式 **/
        // 如果url中path以location中的path开头
        currentDeep = locPath.replace(/^\/|\/$/g).split('/').length;

        // 如果是'/', 长度设置为0
        if (currentDeep === 1 && locPath === '/') {
          currentDeep = 0;
        }

        log.debug('getRewriteRule -', 'get rewrite rule for url =>', urlObj.href.bold.green);
        log.debug(
          'getRewriteRule -',
          'current match location.path =>', locPath.bold.green,
          'deep =>', String(currentDeep).bold.green,
          'last deep =>', String(lastDeep).bold.green,
          'should replace last rule =>', String(currentDeep > lastDeep).bold.green
        );

        // 如果匹配的深度比上一次匹配的深度深（比上次匹配更精确）
        // 替换成新匹配到的规则
        if (currentDeep > lastDeep) {
          rewriteRule = loc;
          lastDeep = currentDeep;
        }
      }
    }
  });

  log.debug('getProxyInfo -', href, '==>', JSON.stringify(rewriteRule));

  return rewriteRule;
}

function toRegExp (str, flags) {
  str = str.replace(/^~\s*\/(.*)\/(\w*)/, '$1 O_o $2');

  var arr = str.split(' O_o ');

  return new RegExp(arr[0], flags === undefined ? arr[2] : flags);
}

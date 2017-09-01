/**
 * @file 获取代理相关的信息
 * @author zdying
 */

var url = require('url');
var path = require('path');

var execCommand = require('../directives/execCommand');
var Transform = require('hiproxy-conf-parser').Transform;
var utils = require('../helpers/utils');
var clone = utils.clone;
var parseCookie = utils.parseCookie;
var parseQueryString = utils.parseQueryString;

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
  if (rewrite /* && rewrite.props.proxy */) {
    // 根据请求信息，设置内置变量
    setBuiltInVars(rewrite, request);
    // 再次替换变量的值
    Transform.replaceVar(rewrite, rewrite.variables, ['extends']);

    var rewriteProps = rewrite.variables;
    var proxyPass = rewriteProps.proxy_pass || '';
    var isBaseRule = rewrite.isBaseRule;
    var alias = rewriteProps.alias;
    var proxyUrlObj = url.parse(proxyPass);
    var protocolReg = /^(\w+:\/\/)/;
    var newUrl, newUrlObj;
    var isLocRegExp = isRegExp(rewrite.location);

    // 如果代理地址中包含具体协议，删除原本url中的协议
    // 最终替换位代理地址的协议
    if (!alias && !isBaseRule && proxyUrlObj.protocol) {
      protocol = proxyUrlObj.protocol;
      originUrl = originUrl.replace(protocolReg, '');
    }

    // 将原本url中的部分替换为代理地址
    if (isLocRegExp) {
      // 如果是正则表达式，直接食用proxy_pass的值
      newUrl = proxyPass;
    } else {
      // 普通地址字符串
      // 否则，把url中的source部分替换成proxy
      newUrl = originUrl.replace(rewrite.extends.domain + rewrite.location, proxyPass);
    }

    var context = {
      request: request
      // props: rewrite.props
    };

    execCommand(rewrite, context, 'request');

    log.debug('newURL ==>', newUrl);
    log.debug('alias  ==>', alias);

    if (alias) {
      // 本地文件系统路径, 删除前面的协议部分
      newUrl = newUrl.replace(/^(\w+:\/\/)/, '').split('?')[0];
    } else {
      newUrlObj = url.parse(newUrl);

      hostname = newUrlObj.hostname || '';
      port = newUrlObj.port;
      path = newUrlObj.path;
    }

    proxyName = 'hiproxy';
  } else if (host) {
    // TODO 这里的协议，到底应该用什么?
    protocol = 'http:';
    hostname = host.split(':')[0];
    // port = (protocol === 'https:') ? 443 : Number(uri.port || host.split(':')[1]);
    port = host.split(':')[1] || uri.port || (protocol === 'https:' ? 443 : 80);
    path = uri.path;
    proxyName = 'hiproxy';
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
    proxyPass: proxyPass,
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
    var locations = rule.locations;
    var urlPath = urlObj.path;
    var loc = null;
    var currentDeep = 0;
    var location = '';
    var isLocRegExp = false;

    for (var i = 0, len = locations.length; i < len; i++) {
      loc = locations[i];
      location = loc.location;
      isLocRegExp = isRegExp(location);

      log.debug('getRewriteRule - current location path =>'.green, String(location).bold.green);
      log.debug('getRewriteRule - current url path =>'.green, urlPath.green);

      if (isLocRegExp) {
        /** 正则表达式 **/
        // var reg = toRegExp(locPath, 'i');

        if (location.test(urlPath)) {
          currentDeep = location.source.replace(/^\\?\/|\\?\/$/g, '').split(/\\?\//).length;

          if (currentDeep > lastDeep) {
            rewriteRule = loc;
          }

          log.debug(
            'getRewriteRule -',
            'regexp match =>', urlPath.match(location),
            'deep =>', String(currentDeep).bold.green,
            'last deep =>', String(lastDeep).bold.green,
            'should replace last rule =>', String(currentDeep > lastDeep).bold.green
          );
        }
      } else if (urlPath.indexOf(location) === 0) {
        /** 非正则表达式 **/
        // 如果url中path以location中的path开头
        currentDeep = location.replace(/^\/|\/$/g, '').split('/').length;

        // 如果是'/', 长度设置为0
        if (currentDeep === 1 && location === '/') {
          currentDeep = 0;
        }

        log.debug('getRewriteRule -', 'get rewrite rule for url =>', urlObj.href.bold.green);
        log.debug(
          'getRewriteRule -',
          'current match location.path =>', String(location).bold.green,
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

  log.debug('getProxyInfo -'.red, href, '==>', utils.toJSON(rewriteRule));

  return clone(rewriteRule);
}

/**
 * 设置内置变量
 *
 * @param {Object} rewrite 当前请求匹配的rewrite规则
 * @param {http.IncomingMessage} request 当前请求对象
 */
function setBuiltInVars (rewrite, request) {
  var variables = rewrite.variables;
  var urlObj = url.parse(request.url);
  var headers = request.headers;
  var cookies = parseCookie(headers.cookie);
  var queryObj = parseQueryString(urlObj.search);
  var tmpKey = '';
  var isLocRegExp = isRegExp(rewrite.location);
  var headerHost = headers.host || '';

  var vars = {
    $host: urlObj.host || headerHost,
    $hostname: urlObj.hostname || headerHost.split(':')[0],
    $search: urlObj.search || '',
    $query_string: urlObj.query || '',
    $server_port: urlObj.port || '80',
    $scheme: (urlObj.protocol || '').replace(':', ''),
    $request_uri: urlObj.href,
    $path: urlObj.path,
    $path_name: urlObj.pathname || '',
    $base_name: path.basename(urlObj.path),
    $dir_name: path.dirname(urlObj.path),
    $hash: urlObj.hash || '',
    $hash_value: (urlObj.hash || '').replace('#', ''),
    $uri: urlObj.href
  };

  // $cookie_name
  for (var cookie in cookies) {
    tmpKey = cookie.toLowerCase().replace(/-/, '_');
    vars['$cookie_' + tmpKey] = cookies[cookie] || '';
  }

  // $http_name
  // arbitrary request header field; the last part of a variable name is the field name
  // converted to lower case with dashes replaced by underscores
  for (var header in headers) {
    tmpKey = header.toLowerCase().replace(/-/, '_');
    vars['$http_' + tmpKey] = headers[header] || '';
  }

  // $arg_name query string value
  for (var arg in queryObj) {
    tmpKey = arg.toLowerCase().replace(/-/, '_');
    vars['$arg_' + tmpKey] = queryObj[arg] || '';
  }

  if (isLocRegExp) {
    // RegExp location
    var urlMatch = urlObj.path.match(rewrite.location);
    if (Array.isArray(urlMatch)) {
      for (var i = 1; i < 9; i++) {
        vars['$' + i] = urlMatch[i] || '';
      }
    }
  }

  for (var key in vars) {
    variables[key] = vars[key];
  }
}

function isRegExp (location) {
  return Object.prototype.toString.call(location) === '[object RegExp]';
}

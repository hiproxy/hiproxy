/**
 * @file Proxy Server
 * @author zdying
 */

require('colors');
var path = require('path');
var EventEmitter = require('events');
var openBrowser = require('op-browser');
var Hosts = require('./hosts');
var Rewrite = require('./rewrite');
var getLocalIP = require('./helpers/getLocalIP');
var Logger = require('./logger');
var createPacFile = require('./helpers/createPacFile');
var showImage = require('./helpers/showImage');
var dirtool = require('./helpers/dirTool');

var initFlow = require('./flows/initialize');
var CALLBACK_NAMES = ['onBeforeRequest', 'onBeforeResponse', 'onData', 'onError'];

// global.log = log;

/**
 * hiproxy代理服务器
 * @param {Object} options 配置参数
 * @param {Number} options.httpPort http代理服务端口号
 * @param {Number} options.httpsPort https代理服务器端口号
 * @param {String} options.dir 指定的工作路径
 * @extends EventEmitter
 * @constructor
 */
function ProxyServer (options) {
  EventEmitter.call(this);

  var httpPort = 0;
  var httpsPort = 0;
  var dir = process.cwd();

  // TODO 更新文档，说明参数
  if (options && typeof options === 'object') {
    httpPort = options.httpPort;
    httpsPort = options.httpsPort;
    dir = options.dir || dir;
  } else {
    httpPort = arguments[0];
    httpsPort = arguments[1];
    dir = arguments[2] || dir;
  }

  this.options = options || {};

  this.hosts = new Hosts();
  this.rewrite = new Rewrite();

  this.logger = new Logger(/* process.stdout, process.stderr */);

  // 如果没有指定httpPort, 默认随机分配
  this.httpPort = httpPort || 0;
  this.httpServer = null;

  // 如果没有指定httpsPort，默认不随机分配
  this.httpsPort = httpsPort;
  this.httpsServer = null;

  this.dir = dir;

  this._initCallbacks();
}

ProxyServer.prototype = {
  constructor: ProxyServer,
  // extends from EventEmitter
  __proto__: EventEmitter.prototype,

  _initCallbacks: function () {
    var callbackNames = CALLBACK_NAMES;
    var options = this.options;

    callbackNames.forEach(function (cbk) {
      var cbks = options[cbk] || (options[cbk] = []);
      if (!Array.isArray(cbks)) {
        options[cbk] = [cbks];
      }
    });
  },

  /**
   * 启动代理服务
   *
   * @param {Object} config 配置字段
   * @return {Promise}
   * @public
   */
  start: function (config) {
    var hiproxy = this;
    var ip = getLocalIP();
    hiproxy.localIP = ip;
    return new Promise(function (resolve, reject) {
      initFlow.use(function (ctx, next) {
        resolve([hiproxy.httpServer, hiproxy.httpsServer]);
        next();
      });
      initFlow.run({
        localIP: ip,
        args: config || {}
      }, null, hiproxy);
    });
  },

  /**
   * 停止代理服务
   * @return {ProxyServer}
   * @public
   */
  stop: function () {
    this.httpServer.close();

    if (this.httpsServer) {
      this.httpsServer.close();
    }

    /**
     * Emitted when the hiproxy server(s) stop.
     * @event ProxyServer#stop
     */
    this.emit('stop');

    return this;
  },

  /**
   * 重启代理服务
   * @return {ProxyServer}
   * @public
   */
  restart: function () {
    return this.stop().start();
  },

  /**
   * 添加Hosts文件
   *
   * @param {String|Array} filePath `hosts`文件路径（绝对路径）
   * @return {ProxyServer}
   * @public
   */
  addHostsFile: function (filePath) {
    /**
     * Emitted when add hosts file.
     * @event ProxyServer#addHostsFile
     * @property {Array|String} filePath rewrite file path(s)
     */
    this.emit('addHostsFile', filePath);

    this.logger.debug('add hosts file: ' + filePath);

    this.hosts.addFile(filePath);
    this.createPacFile();
    return this;
  },

  /**
   * 添加rewrite文件
   *
   * @param {String|Array} filePath `rewrite`文件路径（绝对路径）
   * @return {ProxyServer}
   * @public
   */
  addRewriteFile: function (filePath) {
    /**
     * Emitted when add rewrite file.
     * @event ProxyServer#addRewriteFile
     * @property {Array|String} filePath rewrite file path(s)
     */
    this.emit('addRewriteFile', filePath);

    this.logger.debug('add rewrite file: ' + filePath);

    this.rewrite.addFile(filePath);
    this.createPacFile();
    return this;
  },

  /**
   * 添加rewrite规则
   *
   * @param {String|Array} source `rewrite`规则代码片段
   * @return {ProxyServer}
   * @public
   */
  addRewriteRule: function (source) {
    /**
     * Emitted when add rewrite file.
     * @event ProxyServer#addRewriteRule
     * @property {Array|String} filePath rewrite file path(s)
     */
    this.emit('addRewriteRule', source);

    this.logger.debug('add rewrite rule: ' + source);

    this.rewrite.addRule(source);
    this.createPacFile();
    return this;
  },

  /**
   * 打开浏览器窗口
   *
   * @param {String} browserName 浏览器名称
   * @param {String} url         要打开的url
   * @param {Boolean} [usePacProxy=false] 是否使用自动代理
   * @return {ProxyServer}
   * @public
   */
  openBrowser: function (browserName, url, usePacProxy) {
    var self = this;

    if (usePacProxy) {
      this.createPacFile().then(function (success) {
        self._open(browserName, url, true);
      });
    } else {
      this._open(browserName, url, false);
    }

    return this;
  },

  _open: function (browserName, url, usePacProxy) {
    var proxyURL = 'http://127.0.0.1:' + this.httpPort;
    var dataDir = path.join(dirtool.getHiproxyDir(), 'data-dir');

    if (usePacProxy) {
      openBrowser.open(browserName, url, '', proxyURL + '/proxy.pac', dataDir);
    } else {
      openBrowser.open(browserName, url, proxyURL, '', dataDir);
    }
    return this;
  },

  /**
   * 创建自动配置代理文件
   * @private
   */
  createPacFile: function () {
    var hosts = this.hosts.getHost();
    var rewrite = this.rewrite.getRule();
    var logger = this.logger;

    var allDomains = Object.keys(hosts).concat(Object.keys(rewrite));
    var domains = {};

    allDomains.forEach(function (domain) {
      domains[domain] = 1;
    });

    /**
     * Emitter when the `pac` proxy file is created or updated.
     * @event ProxyServer#creatPacFile
     * @property {Object} domains domain list
     */
    this.emit('creatPacFile', domains);

    return createPacFile(this.httpPort, this.localIP, domains)
      .then(function () {
        return true;
      })
      .catch(function (err) {
        logger.debug(err);
        return false;
      });
  },

  enableConfFile: function (type, filePath) {
    this[type] && this[type].enableFile(filePath);
  },

  disableConfFile: function (type, filePath) {
    this[type] && this[type].disableFile(filePath);
  },

  updateConfFileContent: function (type, content) {
    // TODO
  },

  getDisabledConfFile: function (type, filePaths) {
    // TODO
    // get Host/Rewrite file status
    return null;
  },

  /**
   * 添加配置规则，包括hosts和rewrite。
   *
   * @param {String} type 规则类型，可选值为`rewrite`和`hosts`
   * @param {String} content 规则内容配置代码，比如`127.0.0.1 hiproxy.org`
   * @param {String} [fileName] 文件名称，主要用于在插件中显示，默认会自动生成一个随机的名称
   * @returns this
   */
  addRule: function (type, content, fileName) {
    if (type === 'hosts' || type === 'rewrite') {
      this[type].addRule(content, fileName);
      this.createPacFile();
    }

    return this;
  },

  /**
   * 服务启动后，显示服务信息
   *
   * @param {Array} servers 启动的服务
   */
  showStartedMessage: function () {
    var proxyAddr = this.httpServer.address();
    var httpsAddr = this.httpsServer && this.httpsServer.address();
    var workspace = global.args.workspace || process.cwd();
    var ip = getLocalIP();
    var hostFilePath = Object.keys(this.hosts._files);
    var rewriteFilePath = Object.keys(this.rewrite._files);
    var images = [
      '',
      '    Proxy address: '.bold.green + ('http://' + ip + ':' + proxyAddr.port).underline,
      '    Https address: '.bold.magenta + (httpsAddr ? ('https://' + ip + ':' + httpsAddr.port).underline : 'disabled'),
      '    Proxy file at: '.bold.yellow + ('http://' + ip + ':' + proxyAddr.port + '/proxy.pac').underline,
      '    SSL/TLS cert : '.bold.magenta + ('http://' + ip + ':' + proxyAddr.port + '/ssl-certificate').underline,
      '    Workspace at : '.bold.cyan + workspace.underline
    ];

    if (hostFilePath.length) {
      images.push('hosts files : \n  '.bold.green + hostFilePath.join('\n  '));
    }
    if (rewriteFilePath.length) {
      images.push('rewrite files : \n  '.bold.green + rewriteFilePath.join('\n  '));
    }

    return showImage(images);
  },

  /**
   * Add callbacks for hiproxy
   *
   * @param {String} type callback types, valid values: 'onBeforeRequest', 'onBeforeResponse', 'onData', 'onError'.
   * @param {Function} fn callback function.
   */
  addCallback: function (type /* , fn1, fn2, ... */) {
    var validTypes = CALLBACK_NAMES;
    var fns = [].slice.call(arguments, 1);
    var cbks = this.options[type];

    if (type && validTypes.indexOf(type) !== -1) {
      fns.forEach(function (fn) {
        if (typeof fn === 'function') {
          cbks.push(fn);
        }
      });
    } else {
      this.logger.warn('Invalid callback type `' + type + '` for `addCallback()`, valid values:', CALLBACK_NAMES.join(', ') + '.');
    }
  },

  /**
   * for web api test
   */
  testWebAPI: function () {
    if (process.env.NPM_TEST) {
      this.testWebAPICalled = true;
    } else {
      throw Error('The `testWebAPI()` should not be called in production evn.');
    }
  }
};

module.exports = ProxyServer;

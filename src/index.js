/**
 * @file Proxy Server
 * @author zdying
 */

require('colors');
var path = require('path');
var EventEmitter = require('events');
var openBrowser = require('op-browser');
var homedir = require('os-homedir');
var Hosts = require('./hosts');
var Rewrite = require('./rewrite');
var getLocalIP = require('./helpers/getLocalIP');
var Logger = require('./helpers/logger');
var createServer = require('./helpers/createServer');
var listeners = require('./listeners');
var createPacFile = require('./helpers/createPacFile');
var glob = require('./helpers/glob');

// global.log = log;

/**
 * hiproxy代理服务器
 * @param {Number} httpPort http代理服务端口号
 * @param {Number} httpsPort https代理服务器端口号
 * @param {String} dir 指定的工作路径
 * @extends EventEmitter
 * @constructor
 */
function ProxyServer (httpPort, httpsPort, dir) {
  EventEmitter.call(this);

  this.hosts = new Hosts();
  this.rewrite = new Rewrite();

  this.logger = new Logger(/*process.stdout, process.stderr*/);

  this.httpPort = httpPort;
  this.httpServer = null;

  this.httpsPort = httpsPort;
  this.httpsServer = null;

  this.dir = dir;

  global.log = this.logger;
}

ProxyServer.prototype = {
  constructor: ProxyServer,
  // extends from EventEmitter
  __proto__: EventEmitter.prototype,

  /**
   * 启动代理服务
   *
   * @param {Object} config 配置字段
   * @return {Promise}
   * @public
   */
  start: function (config) {
    var self = this;
    var promises = [
      getLocalIP(),
      createServer.create(this.httpPort, false, this.rewrite)
    ];

    config = config || {};

    if (this.httpsPort) {
      promises.push(createServer.create(this.httpsPort, true, this.rewrite));
    }

    return Promise.all(promises)
      .then(function (values) {
        self.localIP = values[0];
        self.httpServer = values[1];
        self.httpsServer = values[2];

        setTimeout(function () {
          self._initEvent();
          self.findConfigFiels(self.dir, config);
          // self.addConfigFiles(config);
        }, 0);

        /**
         * Emitted when the hiproxy server(s) start.
         * @event ProxyServer#start
         * @property {Array} servers http/https server
         * @property {String} localIP the local ip address
         */
        self.emit('start', {
          servers: values.slice(1),
          localIP: values[0]
        });

        return values.slice(1);
      });
      // .catch(function (err) {
      //   self.logger.error(err);
      // });
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
   * 添加指令
   *
   * @param {String} name  指令名称
   * @param {String} scope 指令作用域
   * @param {Function} fn  指令执行函数
   * @private
   */
  // addDirective: function(name, scope, fn){
  //
  // },

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
    var dataDir = path.join(homedir(), '.hiproxy', 'data-dir');

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

  /**
   * 在指定工作空间（目录）下查找配置文件
   * hiproxy会在指定的空间下所有一级目录下查找配置文件
   * @param {String} [dir=process.cwd()] 工作空间（目录）
   * @return {ProxyServer}
   * @public
   */
  findConfigFiels: function (dir, config) {
    var self = this;
    var logger = this.logger;
    var hostsPattern = config.hostsFile;
    var rewritePattern = config.rewriteFile;

    if (hostsPattern == null) {
      hostsPattern = ['./*/hosts'];
    }

    if (rewritePattern == null) {
      rewritePattern = ['./*/rewrite'];
    }

    var hostsFiles = glob(hostsPattern, dir);
    var rewriteFiles = glob(rewritePattern, dir);

    logger.debug('add hosts [', hostsFiles.join(', ').bold.green, ']');
    logger.debug('add rewrites [', (rewriteFiles.join(', ')).bold.green, ']');

    // 将找到的Hosts文件解析并加入缓存
    self.addHostsFile(hostsFiles);

    // 将找到的rewrite文件解析并加入缓存
    self.addRewriteFile(rewriteFiles);

    return this;
  },

  /**
   * 添加配置文件
   */
  // addConfigFiles: function (config) {
  //   if (config.hostsFile) {
  //     this.addHostsFile(config.hostsFile);
  //   }

  //   if (config.rewriteFile) {
  //     this.addRewriteFile(config.rewriteFile);
  //   }
  // },

  _initEvent: function () {
    var self = this;
    // var port = this.httpPort;
    // var url = 'http://127.0.0.1:' + port;
    // var pac = url + '/proxy.pac';
    var server = this.httpServer;
    var httpsServer = this.httpsServer;

    server
      .on('request', listeners.request.bind(this))
      .on('connect', listeners.connect.bind(this));

    // https中间人代理服务器事件绑定
    // 中间人代理服务收到请求时：
    //  1. 如果是`127.0.0.1`的请求，返回代理服务器的相关页面
    //  2. 如果是其他的请求，去请求资源
    httpsServer && httpsServer
      .on('request', function (req, res) {
        var url = req.url;
        var host = req.headers.host;
        var protocol = req.client.encrypted ? 'https' : 'http';

        self.logger.debug('http middle man _server receive request ==>', protocol, host, url);

        /**
         * Emitted each time there is a request to the https server.
         * @event ProxyServer#httpsRequest
         * @property {http.IncomingMessage} request request object
         * @property {http.ServerResponse} response response object
         */
        self.emit('httpsRequest', req, res);
        // self.emit('request', req, res);

        if (!url.match(/^\w+:\/\//)) {
          req.url = protocol + '://' + host + url;
        }

        if (host === '127.0.0.1:' + this.httpsPort) {
          res.end('the man in the middle page: ' + url);
          // if(url === '/'){
          //     res.end('the man in the middle.');
          // }else if(url === '/favicon.ico'){
          //     res.statusCode = 404;
          //     res.end('404 Not Found.');
          // }else{
          //     res.statusCode = 404;
          //     res.end('404 Not Found.');
          // }
        } else {
          listeners.request.call(this, req, res);
        }
      }.bind(this));

    return this;
  }
};

module.exports = ProxyServer;

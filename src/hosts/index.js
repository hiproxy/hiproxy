/**
 * @file hosts管理
 * @author zdying
 */
var fs = require('fs');
var parser = require('./parser');

function Hosts () {
  this._rules = {};
  this._files = {};
}

Hosts.prototype = {
  constructor: Hosts,

  /**
   * 添加Hosts文件
   * @param {String|Array} filePath
   * @returns this
   */
  addFile: function (filePath) {
    var _files = this._files;

    if (filePath) {
      if (!Array.isArray(filePath)) {
        filePath = [filePath];
      }

      filePath.forEach(function (file) {
        if (!(file in _files)) {
          _files[file] = {
            enable: this._initFileStatus(file)
          };
          this._watchFile(file);
        }
      }.bind(this));

      this.update();
    }
    return this;
  },

  /**
   * 删除Hosts文件
   * @param {String|Array} filePath
   * @returns this
   */
  deleteFile: function (filePath) {
    var _files = this._files;

    if (filePath) {
      if (!Array.isArray(filePath)) {
        filePath = [filePath];
      }

      filePath.forEach(function (file) {
        delete _files[file];
        this._unwatchFile(file);
      }.bind(this));

      this.update();
    }
    return this;
  },

  /**
   * 启用Hosts文件规则
   * @param {String|Array} filePath
   * @returns this
   */
  enableFile: function (filePath) {
    var _files = this._files;

    if (filePath) {
      if (!Array.isArray(filePath)) {
        filePath = [filePath];
      }

      filePath.forEach(function (file) {
        if (file in _files && !_files[file].enable) {
          _files[file].enable = true;
          this._watchFile(file);
          this.update();
        }
      }.bind(this));
    }
    return this;
  },

  /**
   * 禁用Hosts文件规则
   * @param {String|Array} filePath
   * @returns this
   */
  disableFile: function (filePath) {
    var _files = this._files;

    if (filePath) {
      if (!Array.isArray(filePath)) {
        filePath = [filePath];
      }

      filePath.forEach(function (file) {
        if (file in _files && _files[file].enable) {
          _files[file].enable = false;
          this._unwatchFile(file);
          this.update();
        }
      }.bind(this));
    }

    return this;
  },

  _initFileStatus: function (file) {
    // TODO
    // Get status from local file.
    return true;
  },

  _saveFileStatus: function () {
    // TODO
    // Save to local file.
    return null;
  },

  _watchFile: function (file) {
    fs.watchFile(file, { interval: 500 }, function (curr, prev) {
      if (Date.parse(curr.ctime) === 0) {
        this.deleteFile(file);
      } else if (Date.parse(curr.mtime) !== Date.parse(prev.mtime)) {
        log.debug(file.bold.green, 'changed.');
        this.update();
      }
    }.bind(this));
  },

  _unwatchFile: function (file) {
    fs.unwatchFile(file);
  },

  /**
   * 添加Hosts规则
   * @returns this
   */
  // addHost: function(){
  //     //TODO ...
  //     return this;
  // },

  /**
   * 获取解析后的规则
   *
   * @param {String} [domain]
   */
  getHost: function (domain) {
    return domain ? this._rules[domain] : this._rules;
  },

  /**
   * 清空所有的Hosts规则
   *
   * @returns this
   */
  clearRules: function () {
    this._rules = {};

    return this;
  },

  /**
   * 清空所有的Hosts文件
   *
   * @returns this
   */
  // clearFiles: function(){
  //     this._files = {};

  //     return this;
  // },

  /**
   * 更新Hosts规则
   * @returns this
   */
  update: function () {
    this.clearRules();

    var _files = this._files;
    var _rules = this._rules;
    var parsedResult;

    for (var key in _files) {
      if (!_files[key].enable) continue;

      parsedResult = Hosts.parseFile(key);
      _files[key]['result'] = parsedResult;

      for (var domain in parsedResult) {
        _rules[domain] = parsedResult[domain];
      }
    }

    this._saveFileStatus();

    log.debug('hosts updated.');
    log.detail('hosts rules:', JSON.stringify(_rules));

    // console.log(_files);

    return this;
  }
};

/**
 * 解析规则
 *
 * @param {String|Array} source
 * @returns {Object}
 */
// Hosts.parse = function (source) {

// };

/**
 * 解析文件
 *
 * @param {String|Array} filePath
 * @returns {Object}
 */
Hosts.parseFile = function (filePath) {
  return parser(filePath);
};

module.exports = Hosts;

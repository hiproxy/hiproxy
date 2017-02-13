/**
 * @file hosts管理
 * @author zdying
 */
var fs = require('fs');
var parser = require('./parser');

function Hosts(){
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
    addFile: function(filePath){
        var _files = this._files;
        var self = this;

        if(filePath){
            if(!Array.isArray(filePath)){
                filePath = [filePath];
            }

            filePath.forEach(function(file){
                if(!(file in _files)){
                    _files[file] = {};
                    fs.watchFile(file, {interval: 500}, function(curr, prev){
                        if(curr.mtime !== prev.mtime){
                            log.debug(file.bold.green, 'changed.');
                            self.update();
                        }
                    });
                }
            });

            this.update();
        }
        return this;
    },

    /**
     * 删除Hosts文件
     * @param {String|Array} filePath
     * @returns this
     */
    deleteFile: function(filePath){
        var _files = this._files;

        if(filePath){
            if(!Array.isArray(filePath)){
                filePath = [filePath];
            }

            filePath.forEach(function(file){
                delete _files[file];
                fs.unwatchFile(file);
            });

            this.update();
        }
        return this;
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
    getHost: function(domain) {
        return domain ? this._rules[domain] : this._rules;
    },

    /**
     * 清空所有的Hosts规则
     * 
     * @returns this
     */
    clearRules: function(){
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
    update: function(){
        this.clearRules();

        var _files = this._files;
        var _rules = this._rules;
        var parsedResult;

        for(var key in _files){
            parsedResult = Hosts.parseFile(key);
            _files[key] = parsedResult;

            for(var domain in parsedResult){
                _rules[domain] = parsedResult[domain];
            }
        }

        log.debug('hosts updated.');
        log.detail('hosts rules:', JSON.stringify(_rules));

        return this;
    }
};

/**
 * 解析规则
 * 
 * @param {String|Array} source
 * @returns
 */
Hosts.parse = function(source){

};

/**
 * 解析文件
 * 
 * @param {String|Array} filePath
 * @returns
 */
Hosts.parseFile = function(filePath){
    return parser(filePath)
};

module.exports = Hosts;
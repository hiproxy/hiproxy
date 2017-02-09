/**
 * @file Format AST tree to object that is easy to use
 * @author zdying
 */

var commandFuncs = require('../commands');
var merge = require('../../helpers/merge');
var type = require('../../helpers/type');

var replaceVar = require('./../tools/replaceVar');
var scopeCmds = require('../commands/scope');

module.exports = function formatAST(ASTTree){
    var res = {
        commands: [],
        props: {},
        domains: {},
        filePath: ASTTree.filePath,
        __id__: 'global'
    };

    var baseRules = ASTTree.baseRules || [];
    var domains = ASTTree.domains || [];
    var commands = ASTTree.commands || [];

    var globalFuncs = res.commands = commands;// = parseCommand(commands);

    // step 1: 执行全局命令(比如: `set $domain example.com`)
    execCommand(globalFuncs, res, 'global');

    // step 1.1: 替换全局变量中的变量
    res.props = replaceVar(res.props, res);

    // step 1.2: 替换全局指令中的变量
    res.commands = replaceFuncVar(globalFuncs, res);

    // replaceProps(res.props, res);

    // step 2: 解析基本规则(比如: `example.com => other.com`)
    parseBaseRule(baseRules, res);

    parseDomain(domains, res);

    // console.log(JSON.stringify(res, null, 4));

    return res
};

/**
 * 将baseRule解析成标准的domain／location对象
 * @param baseRules
 * @param res
 */
function parseBaseRule(baseRules, res){
    baseRules.forEach(function(rule){
        var arr = rule.split(/\s*=>\s*/);
        var source = arr[0];
        var target = arr[1];
        var url = require('url');

        // step 3: 替换基本规则中的变量
        source = replaceVar(source, res);
        target = replaceVar(target, res);

        if(!/^[\w\d]+:\/\//.test(source)){
            source = 'http://' + source;
        }

        var urlObj = url.parse(source);
        var hostname = urlObj.hostname;

        if(hostname){
            res.domains[hostname] = {
                domain: hostname,
                location: [
                    {
                        isBaseRule: true,
                        path: urlObj.path || '/',
                        source: source,
                        props: {
                            proxy: target
                        }
                    }
                ]
            }
        }
    });
}

function parseDomain(domains, res){
    // step 4: 解析Domain(比如: `example.com = { ... }`)
    domains.forEach(function(domain){
        var _domain = domain.domain;
        var location = domain.location;
        var funcs = domain.commands || []; //parseCommand(domain.commands || []);

        domain.__id__ = '_domain_' + _domain;

        domain.toJSON = toJSON;

        domain.parent = res;
        domain.parentID = res.__id__;

        // step 5: 执行domain中的命令(比如: set $domain example.com)
        // 这里必须先执行命令, 然后在替换值
        // 这样才能保证domain里面的变量优先级高于上一级(全局)变量
        execCommand(funcs, domain, 'domain');

        // step 5.1: 替换domain规则中的变量

        // _domain属于顶层, 应该用上一层(全局)变量替换
        _domain = replaceVar(_domain, res);

        // domain中的变量, 属于domain, 用domain的变量和上一层变量替换
        replaceVar(domain.props, domain);

        // funcs里面的变量属于domain, 用domain的变量和上一层变量替换
        funcs.forEach(function(fun){
            var params = fun.params;
            var name = fun.name;

            if(name === 'set'){
                // 如果是 set 命令, 不替换第一个参数
                fun.params = [params[0]].concat(replaceVar(fun.params.slice(1), domain))
            }else{
                fun.params = replaceVar(fun.params, domain)
            }
        });

        // step 6: 如果没有location, 直接返回domain对象
        if(!Array.isArray(location) || location.length === 0){
            res.domains[_domain] = {
                source: _domain,
                commands: funcs,
                props: domain.props,
                parent: res,
                location: [],
                toJSON: toJSON
            };
            return
        }else{
            res.domains[_domain] = domain;
        }

        // res[_domain] = {
        //     _domain: _domain
        // };

        domain.location = [];
        parseLocation(domain, location, res);
    });
}

function parseLocation(domain, location, res){
    // step 7: 合并location
    location.forEach(function(loc){
        var location = loc.location;
        var url = domain.domain + location;
        var proxy;
        var props;
        var funcs = loc.commands || []; //parseCommand(loc.commands || []);

        loc.__id__ = '_location_' + location;
        loc.parent = domain;
        loc.toJSON = toJSON;

        // step 8: 执行location命令(比如: `set $domain example.com`)
        execCommand(funcs, loc, 'location');

        loc.props = replaceVar(loc.props, loc);
        location = replaceVar(location, loc);

        // step 9: 替换location变量, 作用域为domain和上层(res)
        url = replaceVar(url, loc);
        proxy = replaceVar(loc.props.proxy, loc);

        funcs.forEach(function(fun){
            var params = fun.params;
            var name = fun.name;

            if(name === 'set'){
                // 如果是 set 命令, 不替换第一个参数
                fun.params = [params[0]].concat(replaceVar(fun.params.slice(1), loc))
            }else{
                fun.params = replaceVar(fun.params, loc)
            }

            // console.log('替换location的function参数:', name, fun.params);
        });

        props = merge({}, loc.props, {
            proxy: proxy
        });

        // 替换正则表达式
        url = url.replace(/(.*?)~\/(.*)/, '~ /$1$2');

        domain.location.push({
            path: location,
            originPath: loc.location,
            source: url,
            commands: funcs,
            props: props,
            // location: loc,
            parent: domain,
            parentID: domain.__id__,
            toJSON: toJSON
        });
    })
}

function execCommand(funcs, context, scope){
    if(!Array.isArray(scopeCmds[scope])){
        log.error('invalid scope', scope.bold.yellow, '(not exists or not an array).');
    }else{
        var cmds = scopeCmds[scope];
        funcs.forEach(function(func){
            if(cmds.indexOf(func.name) !== -1){
                commandFuncs[func.name].apply(context, func.params);
            }else{
                // console.log(func.name, 'is not in the', scope, 'scope, skipped.');
                // log.debug(func.name.bold.yellow, 'is not in the', scope, 'scope, skipped.')
            }
        });
    }
}

// function parseCommand(commands){
//     if(!Array.isArray(commands)){
//         commands = [commands]
//     }
//
//     return commands.map(function(command){
//         var array = command.split(/\s+/);
//         return {
//             name: array[0],
//             params: array.slice(1)
//         }
//     });
// }


function replaceFuncVar(funcs, source){
    funcs.forEach(function(fun){
        var params = fun.params;
        var name = fun.name;

        if(name === 'set'){
            // 如果是 set 命令, 不替换第一个参数
            fun.params = [params[0]].concat(replaceVar(fun.params.slice(1), source))
        }else{
            fun.params = replaceVar(fun.params, source)
        }

        // console.log('替换function参数:', name, fun.params);
    });

    return funcs
}

/**
 * 定义toJSON，避免JSON.stringify()出现循环引用
 * @returns {{}}
 */
function toJSON(){
    var tmp = {};

    for(var key in this){
        if(key !== 'parent'){
            tmp[key] = this[key]
        }else{
            tmp[key] = this[key].__id__
        }
    }

    return tmp
}

//test
// var log = require('../helpers/log');
// var fs = require('fs');
// var util = require('util');
// var AST = require('./AST');
// var sourceCode = fs.readFileSync(__dirname + '/example/rewrite');
// var ASTTree = AST(sourceCode);
// var formatedTree = module.exports(ASTTree);
//
// console.log(':::formated tree:::');
// console.log(JSON.stringify(formatedTree, function(key, value){
//     if(key === 'parent'){
//         return undefined;
//     }else{
//         return value
//     }
// }, 4));

// console.log(util.inspect(formatedTree, {depth: 20}));
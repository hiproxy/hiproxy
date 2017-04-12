/**
 * @file 解析参数，执行响应的命令
 * @author zdying
 */

'use strict';

function args(){
    var _options = {
        'version': {
            default: true,
            describe: '显示版本信息',
            alias: 'v',
            usage: 'hiproxy --version',
            arg: ''
        },
        'help': {
            default: true,
            describe: '显示帮助信息',
            alias: 'h',
            usage: 'hiproxy [cmd] --help',
            arg: ''
        }
    };
    var _cmds = {};
    var _version = '';

    return {
        parse: function(_argv){
            var argv = Array.isArray(_argv) ? _argv : process.argv;
            var args = argv.slice(2);
            var curr, currValue, next, argName;
            var isFullArg, isShortArg;
            var result = {_:[]};

            for(var i = 0, len = args.length; i < len; i++){
                curr = args[i];
                next = args[i + 1];

                argName = curr.replace(/^\-{1,2}/, '')

                isFullArg = isFullArgName(curr);
                isShortArg = isShortArgName(curr);

                if(isFullArg || isShortArg){
                    // 如果当前argv是参数
                    if(!next || next.indexOf('-') === 0){
                        // 如果下一个不是当前参数的值
                        currValue = true;
                    }else{
                        currValue = next;
                        i++;
                    }
                }

                if(isFullArg){
                    result[toCamelCase(argName)] = currValue;
                }else if(isShortArg){
                    argName.split('').forEach(function(_argName, index){
                        result[_argName] = index === argName.length - 1 ? currValue : true;
                    });
                }else{
                    result._.push(curr);
                }
            }

            var currentOption, currentAlias;
            for(var option in _options){
                currentOption = _options[option];
                currentAlias = currentOption.alias;

                option = toCamelCase(option);
                currentAlias = toCamelCase(currentAlias);

                if(currentAlias){
                    if(option in result){
                        result[currentAlias] = result[option];
                    }else if(currentAlias in result){
                        result[option] = result[currentAlias];
                    }
                }
            }

            var cmdName = result._[0];

            // console.log('result:', result);
            // console.log('\n\n');

            if(cmdName){
                if(_cmds[cmdName]){
                    if(result.help){
                        console.log('help info for `' + cmdName + '`');
                    }else if(typeof _cmds[cmdName].fn === 'function'){
                        _cmds[cmdName].fn.apply(result, result._.slice(1))
                    }
                }else{
                    console.log('\n⚠️ 命令`' + cmdName + '`不存在\n');
                }
            }else{
                if(result.version){
                    console.log('v' + _version);
                }else if(result.help){
                    this.help();
                }
            }

            return result
        },

        option: function(key, opt){
            _options[key] = opt || {};
            return this;
        },

        command: function(cmd, desc, fn){
            var cmdArr = cmd.split(/\s+/);
            var cmdName = cmdArr[0];
            var func = fn;
            var paramsLen = 0;
            var paramItems = [];

            if(cmdArr.length > 1){
                paramItems = cmdArr.slice(1);
                
                for(var i = 0, len = paramItems.length; i < len; i++){
                    var paramItem = paramItems[i];

                    if(/^<[^>]+>$/.test(paramItem)){
                        paramsLen++
                    }else{
                        break;
                    }
                }
                func = function(){
                    if(arguments.length < paramsLen){
                        console.log("参数个数不对, 期待`" + paramsLen + "`个，实际接收到`" + arguments.length + "`个")
                    }else{
                        fn.apply(this, arguments)
                    }
                }
            }

            _cmds[cmdName] = {
                describe: desc,
                fn: func
            };

            return this;
        },

        help: function(){
            var lines = [];
            var maxLength = 0;

            // options
            for(var opt in _options){
                var optObj = _options[opt];
                var describe = optObj.describe;
                var alias = optObj.alias;
                var optStr = (alias ? '-' + alias + ', ' : '') + '--' + opt;
                var optStrLen = optStr.length;

                if(optStrLen > maxLength){
                    maxLength = optStrLen;
                }

                lines.push(optStr + ' $$' + optStrLen + '$$ ' + optObj.describe);
            }

            // console.log('==> hiproxy@' + _version + ' <==');
            console.log('Usage: hiproxy [options] [command]\n');
            console.log(lines.join('\n').replace(/\$\$(\d+)\$\$/g, function(match, length){
                return new Array(maxLength - length + 1).join(' ');
            }))
        },

        version: function(ver){
            _version = ver;
            return this;
        }
    }
}

module.exports = args;

function isFullArgName(str){
    return str.indexOf('--') === 0;
}

function isShortArgName(str){
    return str.indexOf('-') === 0;
}

function toCamelCase(str){
    if(!str){
        return str;
    }

    return str.replace(/-(\w)/g, function(match, letter){
        return letter.toUpperCase();
    })
}

// test
/*
var args = module.exports;

args
    .command('help', 'show help info', function(){
        console.log('======= help =======');
    })
    .command('version', 'show version info', function(){
        console.log('v1.1.2');
    })
    .command('start', 'start hiproxy server', function(){
        console.log('start server:', this);
    })
    .command('init <name>', 'init a new project', function(name){
        console.log('init new project, name:', name);
    })

args
    .option('https', {
        default: true,
        describe: 'start https server',
        alias: 's' 
    })
    .option('open', {
        default: 'chrome',
        describe: 'open browser',
        alias: 'o',
        usage: 'open [browser]'
    })
    .option('sub-domains', {
        default: '',
        describe: 'sub domains',
        alias: 'd',
        usage: 'sub-domains [domains...]'
    })
    .option('P', {
        default: '',
        describe: 'output path',
        alias: 'output-path',
        usage: 'output-path <path>'
    })

args.parse();
*/
/**
 * @file 解析参数，执行响应的命令
 * @author zdying
 */

'use strict';

module.exports = {
    parse: function(opt){
        var argv = process.argv;
        var args = argv.slice(2);
        var curr, next, argName;
        var isFullArg, isShortArg;
        var result = {_:[]};

        for(var i = 0, len = args.length; i < len; i++){
            curr = args[i];
            next = args[i + 1];
            isFullArg = isFullArgName(curr);
            isShortArg = isShortArgName(curr);

            if(isFullArg || isShortArg){
                argName = curr.replace(/^\-{1,2}/, '');
                if(isFullArgName(next) || isShortArgName(next)){
                    result[argName] = true;
                }else{
                    result[argName] = next;
                    i++;
                }

                if(isShortArg && opt.alias[argName]){
                    result[opt.alias[argName]] = result[argName];
                }
            }else{
                result._.push(curr);
            }
        }

        return result
    }
};

function isFullArgName(str){
    return str.indexOf('--') === 0;
}

function isShortArgName(str){
    return str.indexOf('-') === 0;
}


console.log(module.exports.parseArgs({
    alias: {
        'a': 'age',
        'n': 'name',
        'm': 'money'
    }
}));
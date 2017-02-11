/**
 * @file
 * @author zdying
 */

var iconMap = {
    'debug'   : '➤',
    'access'  : '✔',
    'info'    : 'ℹ',
    'error'   : '✘',
    'warn'    : '⚠',
    'success' : '✔',
    'detail'  : '❄'
};

// for(var key in iconMap){
//     console.log(iconMap[key]);
// }

module.exports = {
    namespace: function(name){
        var log = Object.create(this);
        log._namespace = name;
        return log;
    },
    debug: function(){
        args.debug && this.printMessage('debug', 'magenta', arguments)
    },
    access: function(req, proxy){
        var statusCode = req.res.statusCode;
        var colormap = {
            404: 'yellow',
            500: 'red',
            304: 'green',
            200: 'white'
        };
        var time = Date.now() - req._startTime;

        this.printMessage('access', 'green', true, [
            req.method.white,
            (req.originalUrl || req.url).gray,
            proxy ? ('==> '.bold.white + proxy.gray) : '',
            String(statusCode)[colormap[statusCode] || 'gray'],
            ('(' + time + 'ms' + ')')[time >= 2000 ? 'yellow' : 'gray']
        ])
    },
    error: function(err){
        var type = Object.prototype.toString.call(err);

        if(type === '[object Error]'){
            this.printMessage('error', 'red', err.message);
            if(args.detail){
                this.printMessage('error', 'red', true, err.stack)
            }
        }else{
            this.printMessage('error', 'red', arguments)
        }
    },
    warn: function(){
        this.printMessage('warn', 'yellow', arguments)
    },
    info: function(){
        this.printMessage('info', 'magenta', arguments)
    },
    detail: function(){
        args.detail && this.printMessage('detail', 'green', arguments)
    },
    printMessage: function(group, groupColor, ignoreNamespace, message){
        var timeStr = '';
        var grep = args.grep;

        if(arguments.length === 3){
            message = ignoreNamespace;
            ignoreNamespace = false;
        }

        if(typeof message === 'object'){
            message = Array.prototype.join.call(message, ' ')
        }

        if(this._namespace && !ignoreNamespace){
            message = this._namespace + ' - ' + message
        }

        if(args.logTime){
            timeStr = '[' + new Date().toLocaleTimeString() + ']';
        }

        if(!grep || message.indexOf(grep) !== -1 || grep === group){
            console.log(timeStr + ' ' + iconMap[group || 'success'].bold[groupColor] + ' ' + message);
        }
    }
};
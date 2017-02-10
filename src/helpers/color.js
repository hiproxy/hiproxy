/**
 * @file 控制台文本颜色
 * @author zdying
 */

'use strict';

(function(){
    var colorDisabled = process.argv.indexOf('--no-color') !== -1;

    var reset = "\x1b[0m";
    var colors = {
        bold : 1,
        dim : 2,
        underscore : 4,
        blink : 5,
        reverse : 7,
        hidden : 8,

        black : 30,
        red : 31,
        green : 32,
        yellow : 33,
        blue : 34,
        magenta : 35,
        cyan : 36,
        gray : 37,
        darkgray : 90,
        lightred : 91,
        lightgreen : 92,
        lightyellow : 93,
        lightblue : 94,
        lightmagenta : 95,
        lightcyan : 96,
        white : 97,

        bgblack : 40,
        bgred : 41,
        bggreen : 42,
        bgyellow : 43,
        bgblue : 44,
        bgmagenta : 45,
        bgcyan : 46,
        bggray : 47,
        bgdarkgray : 100,
        bglightred : 101,
        bglightgreen : 102,
        bglightyellow : 103,
        bglightblue : 104,
        bglightmagenta : 105,
        bglightcyan : 106,
        bgwhite : 107
    };

    for(var color in colors){
        if(colorDisabled){
            String.prototype.__defineGetter__(color, function(){
                return this;
            })
        }else{
            String.prototype.__defineGetter__(color, (function(color) {
                return function(){
                    return '\x1b[' + colors[color] + 'm' + this + reset;
                }
            })(color))
        }
    }
})();
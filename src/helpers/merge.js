/**
 * @file development环境配置文件
 * @author zdying
 */
'use strict';

function type (obj) {
  return ({}).toString.call(obj).replace(/^\[object (\w+)\]$/, '$1').toLowerCase();
}

function shouldMerge (obj) {
  return obj && type(obj).match(/^(object|array)$/);
}

function merge (deep, target, source) {
  var startIndex = 2;
  var args = [].slice.call(arguments, 0);
  var argsLen = args.length;
  var currentSource, currentValue, currentTarget, currentValueType, currentTargetType;

  if (typeof deep !== 'boolean') {
    target = deep;
    deep = false;
    startIndex = 1;
  }

  if (!target) {
    target = {};
  }

  for (var i = startIndex; i < argsLen; i++) {
    currentSource = args[i];

    for (var key in currentSource) {
      currentValue = currentSource[key];
      currentValueType = type(currentValue);
      currentTarget = target[key];
      currentTargetType = type(currentTarget);

      if (deep && shouldMerge(currentValue) && currentTargetType === currentValueType) {
                // 深拷贝并且当前值是可以merge的对象（array或者object）
        if (currentValueType === 'array') {
          currentTarget.push.apply(currentTarget, currentValue);
        } else {
          merge(deep, currentTarget, currentValue);
        }
      } else {
                // 非深拷贝或者不是对象
        target[key] = currentValue;
      }
    }
  }

  return target;
}

module.exports = merge;

// test

// var target = {
//     env: 'prd',
//     thread: 8,
//     supportIE: true,
//     entry: ['abc', 'def'],
//     output: {
//         path: '/target',
//         root: '/target/root',
//         name: '[name]@prd.js'
//     },
//     module: {
//         loaders: [
//             { test: /\.js$/, loader: 'babel-loader' },
//             { test: /\.css$/, loader: 'style-loader!css-loader' }
//         ]
//     },
//     plugin: [
//         {
//             apply: function(){
//                 console.log('test');
//             }
//         },
//         {
//             apply: function(){
//                 console.log('test2');
//             }
//         }
//     ]
// };
//
// var source = {
//     env: 'dev',
//     thread: 6,
//     supportIE: false,
//     entry: ['hij'],
//     output: {
//         path: '/source',
//         name: '[name]@dev.js'
//     },
//     module: {
//         loaders: [
//             { test: /\.scss$/, loader: 'style-loader!css-loader!scss-loader' }
//         ]
//     },
//     plugin: [
//         {
//             apply: function(){
//                 console.log('test source');
//             }
//         }
//     ]
// };
// var res = merge(true, {}, target, source);
// // var res = merge(true, target, source);
// // var res = merge(target, source);
//
// debugger;

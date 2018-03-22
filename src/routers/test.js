// const fs = require('fs');
// const path = require('path');
// const http = require('http');

// var server = http.createServer((req, res) => {
//   const oldEnd = res.end;

//   let body = [];
//   let hasEncoding = false;

//   res.write = function (chunk, encoding) {
//     console.log(typeof chunk);
//     body.push(chunk);
//   };

//   res.end = function () {
//     var data = hasEncoding ? body.join('') : Buffer.concat(body).toString();
//     oldEnd.call(res, '<!-- you have been hacked. -->' + data);
//   };

//   fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
// });

// server.listen(8888);

// var arr = [];

// var buffI = new Buffer('I ');
// var buffAm = new Buffer('am ');
// var string = 'FE';

// arr = [buffI, buffAm, new Buffer(string)];

// var res = Buffer.concat(arr).toString();

// console.log(res);

// var context = {a: 2, b: 3};
// var arr = [];
// var data = '';
// Object.defineProperty(context, 'data', {
//   get: function () {
//     return data;
//   },

//   set: function (value) {
//     console.log('设置了data');
//     arr.push(value);
//     data = value;
//   }
// });

// console.log(context);

// console.log('a, b', context.a, context.b);
// console.log('data', context.data);

// context.data = '123';

// console.log('data', context.data);

// context.data = '456';

// console.log('data', context.data);

// const fs = require('fs');
// const path = require('path');
// const http = require('http');

// var server = http.createServer((req, res) => {
//   // var buffer = new Buffer('赵薇');
//   // res.writeHead(200, {
//   //   'Content-Type': 'text/html; charset=utf-8',
//   //   'Content-Length': buffer.length
//   // });
//   // 输出'赵薇'
//   // res.end(buffer);

//   var string = '赵薇';
//   res.writeHead(200, {
//     'Content-Type': 'text/html; charset=utf-8',
//     'Content-Length': string.length
//   });

//   // 输出'赵'

//   res.end(string);
// });

// server.listen(8888);

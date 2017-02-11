// var assert = require('assert');

// function captureStream(stream) {
//     var oldWrite = stream.write;
//     var buf = '';
//     stream.write = function (chunk, encoding, callback) {
//         buf += chunk.toString(); // chunk is a String or Buffer
//         oldWrite.apply(stream, arguments);
//     }

//     return {
//         unhook: function unhook() {
//             stream.write = oldWrite;
//         },
//         captured: function () {
//             return buf;
//         }
//     };
// }

// describe('console.log', function () {
//     var hook;
//     beforeEach(function () {
//         hook = captureStream(process.stdout);
//     });
//     afterEach(function () {
//         hook.unhook();
//     });
//     it('prints the argument', function () {
//         console.log('hi');
//         assert.equal(hook.captured(), 'hi\n');
//     });
// });
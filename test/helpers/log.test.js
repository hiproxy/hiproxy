var assert = require('assert');

function captureStream(stream) {
    var oldWrite = stream.write;
    var buf = '';
    stream.write = function (chunk, encoding, callback) {
        buf += chunk.toString(); // chunk is a String or Buffer
        oldWrite.apply(stream, arguments);
    }

    return {
        unhook: function unhook() {
            stream.write = oldWrite;
        },
        captured: function () {
            return buf;
        }
    };
}

describe('log', function(){
    var hook;
    beforeEach(function () {
        hook = captureStream(process.stdout);
    });
    afterEach(function () {
        hook.unhook();
    });

    describe('# namespace', function(){
        var log = require('../../src/helpers/log');
        var logger = log.namespace('test-log');

        it('正确添加前缀', function(){
            logger.info('this is a info message.');
            assert.ok(hook.captured().indexOf('test-log') !== -1)
        })
    });

    describe('# methods', function(){
        before(function(){
            global.args = {debug: true, detail: true, logTime: true};
        });
        var log = require('../../src/helpers/log');

        // log.setArgs(args);

        it('#info()', function(){
            var msg = "some info message.";
            log.info(msg);
            assert.ok(hook.captured().indexOf(msg) !== -1)
        });

        it('#warn()', function(){
            var msg = "some info message.";
            log.warn(msg);
            assert.ok(hook.captured().indexOf(msg) !== -1)
        });

        it('#access()', function(){
            var req = {
                url: '/test_api_access',
                method: 'GET',
                _startTime: new Date() - 1000,
                res: {
                    statusCode: 200
                }
            };
            var msg = "GET /test_api_access";
            log.access(req);
            var logInfo = hook.captured();
            assert.ok(logInfo.indexOf('GET') !== -1 && logInfo.indexOf('/test_api_access') !== -1)
        });

        it('#error(Error)', function(){
            var msg = "some error: test_api_error";
            var err = new Error(msg);
            log.error(err);
            var logInfo = hook.captured();
            assert.ok(logInfo.indexOf(msg) !== -1);
        });

        it('#error(String)', function(){
            var msg = "some error: test_api_error";
            log.error(msg);
            var logInfo = hook.captured();
            assert.ok(logInfo.indexOf(msg) !== -1);
        });
    });
});
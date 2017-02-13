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

describe('helpers/args.js (Args Parse):\n', function (){
    var args = require('../../src/helpers/args')();
    var startRes = '';
    var srartContext = '';
    var startArguments = [];

    args.command('start', 'start server', function(){
        startRes = 'ok';
        startContext = this;
        startArguments = arguments;
    });

    args.option('one', {
        alias: 'o'
    });

    args.option('port', {
        alias: 'p'
    });

    args.option('t', {
        alias: 'two'
    });

    args.option('sub-domains', {
        alias: 's'
    });

    args.option('P', {
        alias: 'output-path'
    });

    var argv = 
          '/path/to/node /path/to/file start ' 
        + 'subcmd '
        + '--https '
        + '--port 5525 '
        + '--middle-man-port 10010 '
        + '-a '
        + '-b val '
        + '-s *.a.com,*.a.cn '
        + '-P /file/path/xxx '
        + 'subcmd1 '
        + '-def '
        + '-ot two_val';

    var _args = args.parse(argv.split(' '));

    describe('#parse()', function (){
        describe('正确解析 long option:', function (){
            it('--https ==> {https:true}', function (){
                assert.equal(true, _args.https);
            });

            it('--port 5525 ==> {port: "5525"}', function (){
                assert.equal('5525', _args.port);
            });

            it('--middle-man-port 10010 ==> {middleManPort: 10010}', function (){
                assert.equal('10010', _args.middleManPort);
            });
        });


        describe('正确解析 short option:', function (){
            it('-a ==> {a: true}', function (){
                assert.equal(true, _args.a);
            });

            it('-b val ==> {b: "val"}', function (){
                assert.equal('val', _args.b);
            });

            it('-def ==> {d: true, e: true, f: true}', function (){
                assert.ok(_args.d === true && _args.e === true && _args.f === true);
            });

            it('-ot two_val ==> {o: true, t: "two_val"}', function (){
                assert.ok(_args.o === true && _args.t === 'two_val');
            });
        });

        describe('正确处理 alias: ', function (){
            it('"-o, --one" ==> -o ==> {o: true, one: true}', function(){
                assert.ok(_args.one === _args.o && _args.one === true)
            });

            it('"-p, --port" ==> --port 5525 ==> {p: "5525", port: "5525"}', function(){
                assert.ok(_args.port === _args.p && _args.port === '5525')
            });

            it('"-t, --two" ==> -ot two_val ==> {t: "two_val", two: "two_val"}', function(){
                assert.ok(_args.two === _args.t && _args.t === 'two_val')
            });

            it('"-s, --sub-domains" ==> --sub-domains *.a.com ==> {s: "*.a.com,*.a.cn", subDomains: "*.a.com,*.a.cn"}', function(){
                assert.ok(_args.subDomains === _args.s && _args.s === '*.a.com,*.a.cn')
            });

            it('"--output-path, -P" ==> -P /file/path/xxx ==> {P: "*.a.com,*.a.cn", outputPath: "/file/path/xxx"}', function(){
                assert.ok(_args.outputPath === _args.P && _args.P === '/file/path/xxx')
            });
        });
    });
 
    describe('#exec callback', function (){
        it('正确执行 callback', function (){
            assert.equal("ok", startRes);
        });

        it('传入正确的参数', function (){
            assert.ok(
                startArguments.length === 2 &&
                startArguments[0] === 'subcmd' &&
                startArguments[1] === 'subcmd1'                
            );
        });

        it('设置正确的上下文(this)', function (){
            assert.ok(startContext === _args);
        });
    });

    describe('#other', function(){
        var hook;
        beforeEach(function () {
            hook = captureStream(process.stdout);
        });
        afterEach(function () {
            hook.unhook();
        });

        it('print full help info', function(){
            args.parse('node cli.js --help'.split(' '));

            assert.ok(hook.captured().indexOf('full help info') !== -1)
        });

        it('print help info for cmd', function(){
            args.parse('node cli.js start --help'.split(' '));

            assert.ok(hook.captured().indexOf('help info for `start`') !== -1)
        });

        it('print version info', function(){
            args.parse('node clis.js --version'.split(' '));

            assert.ok(hook.captured().indexOf('版本') !== -1)
        });

        it('print error message when cmd not exists', function(){
            args.parse('node clis.js test-cmd'.split(' '));
            
            assert.ok(hook.captured().indexOf('命令`test-cmd`不存在') !== -1);
        });

        it('cmd args error: "what <name>" ==> "node clis.js test"', function(){
            var name = '';
            args.command('what <name>', 'what name', function(_name){
                name = _name;
            })
            args.parse('node clis.js what'.split(' '));
            
            assert.ok(hook.captured().indexOf('参数个数不对') !== -1 && name === '');
        });

        it('cmd args ok: "what <name> [age]" ==> "node clis.js test zdying" callback get arg "name"', function(){
            var name = '', age = 0;
            args.command('what <name> [age]', 'what name', function(_name, _age){
                name = _name;
                age = _age;
            })
            args.parse('node clis.js what zdying 23'.split(' '));

            assert.ok(name === 'zdying' && age === '23');
        });
    });
});
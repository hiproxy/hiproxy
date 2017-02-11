var assert = require('assert');
describe('helpers/args.js (Args Parse):\n', function (){
    var args = require('../../src/helpers/args');
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
});
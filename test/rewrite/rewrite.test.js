var assert = require('assert');
var path = require('path');
var Rewrite = require('../../src/rewrite/');

describe('rewrite', function(){
    describe('AST', function(){
        var tree = Rewrite.parseFile(path.join(__dirname, 'rewrite'));
        var domain1 = "test.example.com";
        var domain2 = "test.example.cn";
console.log(';;;;;;;;;;;', JSON.stringify(tree, null, 4));
        it('# 正确解析base rule: "test.example.cc => abc.com/def/"', function(){
            var loc = tree.domains['test.example.cc'].location[0];
            assert.equal(true, loc.isBaseRule);
            //TODO 验证 'location[x].source'
            assert.equal('abc.com/def/', loc.props.proxy);            
        });

        it('# 正确解析base rule: "http://test.example.io => http://test.example.io/test/"', function(){
            var loc = tree.domains['test.example.io'].location[0];
            assert.equal(true, loc.isBaseRule);
            //TODO 验证 'location[x].source'
            assert.equal('http://test.example.io/test/', loc.props.proxy)
        });

        it('# 正确解析domain: "domain ' + domain1 + ' {...}"', function(){
            assert.equal('object', typeof tree.domains[domain1]);
        });

        it('# 正确解析domain: "' + domain1 + ' => {...}"', function(){
            assert.equal('object', typeof tree.domains[domain2]);
        });

        it('# 正确解析location: length', function(){
            assert.equal(3, tree.domains[domain1].location.length);
        });

        it('# 正确解析location: path', function(){
            var locs = tree.domains[domain1].location;
            var locPath = locs.map(function(loc){
                return loc.path;
            })
            assert.deepEqual(['/', '/a.json', '/proj/api/'], locPath);
        });

        it('# 正确解析location: proxy', function(){
            var locs = tree.domains[domain1].location;
            assert.equal('http://127.0.0.1:45678/', locs[0].props.proxy);
            assert.equal('http://127.0.0.1:45678/api/a.json', locs[1].props.proxy);
            assert.equal('http://127.0.0.1:45678/api/', locs[2].props.proxy);
        });

        it('# 正确解析全局commands', function(){
            assert.equal(8, tree.commands.length);
            assert.deepEqual(
                {
                    "name": "set",
                    "params": [
                        "$globalvar",
                        "globalvarvalue"
                    ]
                },
                tree.commands[0]
            );
        });

        it('# 正确解析全局commands，变量中使用变量 : "set $varinvar var_$number"', function(){
            assert.deepEqual(
                {
                    "name": "set",
                    "params": [
                        "$varinvar",
                        "var_123.65"
                    ]
                },
                tree.commands[7]
            );

            assert.equal("var_123.65", tree.props['$varinvar'])
        });

        it('# 正确解析全局commands set', function(){
            assert.deepEqual("globalvarvalue", tree.props['$globalvar']);
        });
    })
})
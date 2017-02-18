var assert = require('assert');
var path = require('path');
var fs = require('fs');
var Rewrite = require('../../src/rewrite/');
var AST = require('../../src/rewrite/AST');

describe('rewrite', function(){
    describe('AST', function(){
        var filePath = path.join(__dirname, 'rewrite');
        var source = fs.readFileSync(filePath);
        var tree = AST(source, filePath);

        // console.log('AST tree:', JSON.stringify(tree, null, 4));

        it('# filePath property right', function(){
            assert.equal(filePath, tree.filePath);
        })

        it('# commands', function(){
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

        it('# base rules', function(){
            assert.deepEqual(
                [
                    "test.example.cc => abc.com/def/",
                    "http://test.example.io => http://test.example.io/test/"
                ],
                tree.baseRules
            )
        });

        it('# domains( domain xxx.com {...} )', function(){
            var domainArr = tree.domains.filter(function(domain){
                return domain.domain === 'test.example.com'
            });

            assert.equal(1, domainArr.length);
        });

        it('# domains( xxx.com => {...} )', function(){
            var domainArr = tree.domains.filter(function(domain){
                return domain.domain === 'test.example.cn'
            });

            assert.equal(1, domainArr.length);
        });

        it('# domain.commands', function(){
            var commands = tree.domains[0].commands;

            // source:
            //      proxy_set_header A bbb;
            //      set $local 127.0.0.1:45678;

            assert.equal(2, commands.length);
            assert.deepEqual(
                {
                    "name": "proxy_set_header",
                    "params": [
                        "A",
                        "bbb"
                    ]
                },
                commands[0]
            );
            assert.deepEqual(
                {
                    "name": "set",
                    "params": [
                        "$local",
                        "127.0.0.1:45678"
                    ]
                },
                commands[1]
            );   
        });

        it('# domain.location', function(){
            var domain = tree.domains[0];
            var location = domain.location;
            var len = location.length;
            var pathArr = location.map(function(loc){
                return loc.location
            })

            assert.equal(3, len);
            assert.deepEqual(['/', '/a.json', '/proj/api/'], pathArr);     
        });

        it('# domain.location.commands', function(){
            var domain = tree.domains[0];
            var location = domain.location[0];
            var commands = location.commands;

            assert.equal(2, commands.length);
            assert.deepEqual(
                {
                    "name": "set",
                    "params": [
                        "$cookie",
                        "count_$number1"
                    ]
                },
                location.commands[0]
            );
            assert.deepEqual(
                {
                    "name": "proxy_pass",
                    "params": [
                        "http://$local/"
                    ]
                },
                location.commands[1]
            );      
        })
    });

    describe('AST Format', function(){
        var tree = Rewrite.parseFile(path.join(__dirname, 'rewrite'));
        var domain1 = "test.example.com";
        var domain2 = "test.example.cn";

        // console.log(';;;;;;;;;;;', JSON.stringify(tree, null, 4));

        it('# 正确解析base rule: "test.example.cc => abc.com/def/"', function(){
            var loc = tree.domains['test.example.cc'].location[0];
            assert.equal(true, loc.isBaseRule);
            //TODO 验证 'location[x].source', 自动加了http？
            assert.equal('abc.com/def/', loc.props.proxy);            
        });

        it('# 正确解析base rule: "http://test.example.io => http://test.example.io/test/"', function(){
            var loc = tree.domains['test.example.io'].location[0];
            assert.equal(true, loc.isBaseRule);
            //TODO 验证 'location[x].source'
            assert.equal('http://test.example.io/test/', loc.props.proxy)
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
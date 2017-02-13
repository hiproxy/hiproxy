var assert = require('assert');
var path = require('path');
var fs = require('fs');
var Hosts = require('../../src/hosts');
var log = require('../../src/helpers/log');
var colors = require('colors');
global.args = {};
global.log = log;



describe('#hosts', function(){
    describe('#parse()', function(){
         var hosts = new Hosts();
        var rules = null;

        hosts.addFile(path.join(__dirname, 'hosts'));
        rules = hosts.getHost();

        console.log(rules);

        it('正确解析hosts文件成对象', function(){
            assert.ok(rules && typeof rules === 'object');
        });

        it('一个IP一个域名: 127.0.0.1 test.example.com', function(){
            // 127.0.0.1 test.example.com
            assert.equal('127.0.0.1', rules['test.example.com']);
        });

        it('一个IP多个域名: 192.168.0.1 test.example.cn www.example.cn', function(){
            // 192.168.0.1 test.example.cn www.example.cn
            assert.equal('192.168.0.1', rules['test.example.cn']);
            assert.equal('192.168.0.1', rules['www.example.cn']);
        });

        it('带端口号: 127.0.0.1:8081 www.demo.com', function(){
            // 127.0.0.1:8081 www.demo.com
            assert.equal('127.0.0.1:8081', rules['www.demo.com']);
        });

        it('带端口号: 192.168.0.1:89 test.demo.cn www.demo.cn blog.demo.cn', function(){
            // 192.168.0.1:89 test.demo.cn www.demo.cn blog.demo.cn
            assert.equal('192.168.0.1:89', rules['test.demo.cn']);
            assert.equal('192.168.0.1:89', rules['www.demo.cn']);
            assert.equal('192.168.0.1:89', rules['blog.demo.cn']);        
        });

        it('注释中的规则性不解析: # 192.168.0.1:81 test.zdying.cn', function(){
            assert.ok(!('test.zdying.cn' in rules))
        });

        it('忽略非法格式: 11.22.33.44 www.aaa.com/def', function(){
            assert.ok(!('www.aaa.com/def' in rules))
        });

        it('忽略非法格式: 12.34.56.78', function(){
            assert.equal(-1, JSON.stringify(rules).indexOf('12.34.56.78'))
        });
    });

    describe('#api', function(){
        var hosts = new Hosts();
        var rules = null;
        var filePath = path.join(__dirname, 'hosts_1');

        hosts.addFile(filePath);

        it('addFile()', function(){
            rules = hosts.getHost();
            assert.equal('10.86.10.86', rules['www.my_test.com']);
        });

        it('deleteFile()', function(){
            hosts.deleteFile(filePath)
            rules = hosts.getHost();

            assert.equal(0, Object.keys(rules));
            assert.equal(undefined, rules['www.my_test.com']);
        });
    });

    describe('#watch', function(){
        it('wath file change', function(done){
            var hosts = new Hosts();
            var rules = null;
            var filePath = path.join(__dirname, 'hosts_2');

            hosts.addFile(filePath);
            rules = hosts.getHost();

            fs.writeFile(filePath, '12.34.56.78 blog.my_test.cn\n123.123.110.110 www.my_test.cn', function(err){
                if(err){
                    done(err);
                }else{
                    setTimeout(function(){
                        rules = hosts.getHost();
                        if(rules['www.my_test.cn'] === '123.123.110.110' && rules['blog.my_test.cn'] === '12.34.56.78'){
                            done()
                        }else{
                            done(new Error('error: watch error'))
                        }

                        fs.writeFile(filePath, '10.86.10.86 www.my_test.com', function(){

                        })
                    }, 600);
                }
            });
        })
    })
})
var assert = require('assert');
var request = require('supertest');
var http = require('http');
var path = require('path');

var Proxy = require('../../src/index');

describe('#http server', function(){
    describe('#api', function(){
        it('#start()', function(done){
            var server = new Proxy(8848);
            server.start().then(function(){
                if(server.httpServer instanceof http.Server){
                    done()
                }else{
                    done(new Error('server.httpServer is not an instance of http.Server'))
                }
            });
        });
    });

    describe('#server response', function(){
        it('requrest /', function(done){
            var server = new Proxy(8849);
            server.start().then(function(){
                request('http://127.0.0.1:8849')
                    .get('/')
                    .expect(200, 'proxy file url: http://127.0.0.1:8849/proxy.pac')
                    .end(function(err, res) {
                        if(err){
                            done(err);
                        }else{
                            done();
                        }
                    });
            });
        });
    })
});
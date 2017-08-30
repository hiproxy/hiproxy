var assert = require('assert');
var path = require('path');
var fs = require('fs');
var Rewrite = require('../../src/rewrite/');
var AST = require('../../src/rewrite/AST');

describe('rewrite', function () {
  describe('AST', function () {
    var filePath = path.join(__dirname, 'rewrite');
    var source = fs.readFileSync(filePath);
    var tree = AST(source, filePath);

    // console.log('AST tree:', JSON.stringify(tree, null, 4));

    it('# filePath property right', function () {
      assert.equal(filePath, tree.filePath);
    });

    it('# commands', function () {
      assert.equal(8, tree.commands.length);
      assert.deepEqual(
        {
          'name': 'set',
          'params': [
            '$globalvar',
            'globalvarvalue'
          ]
        },
        tree.commands[0]
      );
    });

    it('# base rules', function () {
      assert.deepEqual(
        [
          'test.example.cc => abc.com/def/',
          'http://test.example.io => http://test.example.io/test/'
        ],
        tree.baseRules
      );
    });

    it('# domains( domain xxx.com {...} )', function () {
      var domainArr = tree.domains.filter(function (domain) {
        return domain.domain === 'test.example.com';
      });

      assert.equal(1, domainArr.length);
    });

    it('# domains( xxx.com => {...} )', function () {
      var domainArr = tree.domains.filter(function (domain) {
        return domain.domain === 'test.example.cn';
      });

      assert.equal(1, domainArr.length);
    });

    it('# domain.commands', function () {
      var commands = tree.domains[0].commands;

      // source:
      //      proxy_set_header A bbb;
      //      set $local 127.0.0.1:45678;
      //      set $str str_domain_scope;

      assert.equal(3, commands.length);
      assert.deepEqual(
        {
          'name': 'proxy_set_header',
          'params': [
            'A',
            'bbb'
          ]
        },
        commands[0]
      );
      assert.deepEqual(
        {
          'name': 'set',
          'params': [
            '$local',
            '127.0.0.1:45678'
          ]
        },
        commands[1]
      );
      assert.deepEqual(
        {
          'name': 'set',
          'params': [
            '$str',
            'str_domain_scope'
          ]
        },
        commands[2]
      );
    });

    it('# domain.location', function () {
      var domain = tree.domains[0];
      var location = domain.location;
      var len = location.length;
      var pathArr = location.map(function (loc) {
        return loc.location;
      });

      assert.equal(3, len);
      assert.deepEqual(['/', '/a.json', '/proj/api/'], pathArr);
    });

    it('# domain.location.commands', function () {
      var domain = tree.domains[0];
      var location = domain.location[0];
      var commands = location.commands;

      assert.equal(3, commands.length);
      assert.deepEqual(
        {
          'name': 'set',
          'params': [
            '$cookie',
            'count_$number1'
          ]
        },
        location.commands[0]
      );
      assert.deepEqual(
        {
          'name': 'set',
          'params': [
            '$str',
            'str_location_scope'
          ]
        },
        location.commands[1]
      );
      assert.deepEqual(
        {
          'name': 'proxy_pass',
          'params': [
            'http://$local/'
          ]
        },
        location.commands[2]
      );
    });
  });

  describe('AST Format', function () {
    var tree = Rewrite.parseFile(path.join(__dirname, 'rewrite'));
    var domain1 = 'test.example.com';
    // var domain2 = 'test.example.cn';

    it('# 正确解析base rule: "test.example.cc => abc.com/def/"', function () {
      var loc = tree['test.example.cc'].locations[0];
      assert.equal('abc.com/def/', loc.variables.proxy_pass);
    });

    it('# 正确解析base rule: "http://test.example.io => http://test.example.io/test/"', function () {
      var loc = tree['test.example.io'].locations[0];
      assert.equal(true, loc.isBaseRule);
      assert.equal('http://test.example.io/test/', loc.variables.proxy_pass);
    });

    it('# 正确解析location: path', function () {
      var locs = tree[domain1].locations;
      var locPath = locs.map(function (loc) {
        return loc.location;
      });
      assert.deepEqual(['/', '/a.json', '/proj/api/'], locPath);
    });

    it('# 正确解析location: proxy_pass', function () {
      var locs = tree[domain1].locations;
      assert.equal('http://127.0.0.1:45678/', locs[0].variables.proxy_pass);
      assert.equal('http://127.0.0.1:45678/api/a.json', locs[1].variables.proxy_pass);
      assert.equal('http://127.0.0.1:45678/api/', locs[2].variables.proxy_pass);
    });

    it('# 正确解析全局commands，变量中使用变量 : "set $varinvar var_$number"', function () {
      assert.equal('var_123.65', tree['test.example.com'].variables['$varinvar']);
    });

    it('# 正确解析全局commands set', function () {
      assert.deepEqual('globalvarvalue', tree['test.example.com'].variables['$globalvar']);
    });

    it('# 局部变量优先级高于上一级变量', function () {
      var domain = tree['test.example.com'];
      var location = domain.locations[0];

      assert.deepEqual('str_domain_scope', domain.variables['$str']);
      assert.deepEqual('str_location_scope', location.variables['$str']);
    });
  });
  describe('api', function () {
    var rewrite = new Rewrite();
    var rule = null;
    var filePath = path.join(__dirname, 'rewrite_2');

    rewrite.addFile(filePath);

    it('disableFile()', function () {
      rule = rewrite.getRule('blog.hiproxy.org');
      assert.equal(true, rule.length > 0);

      rewrite.disableFile(filePath);
      rule = rewrite.getRule('blog.hiproxy.org');
      assert.equal(undefined, rule);
    });
    it('enableFile()', function () {
      rewrite.enableFile(filePath);
      rule = rewrite.getRule('blog.hiproxy.org');
      assert.equal(true, rule.length > 0);
    });
  });
});

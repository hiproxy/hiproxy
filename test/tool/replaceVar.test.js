var assert = require('assert');

var replaceVar = require('../../src/rewrite/replaceVar');

describe('#replaceVar', function () {
  var _global = {
    props: {
      '$keyA': 'global A value',
      '$keyB': 'global B value',
      '$keyC': 'global C value'
    }
  };
  var domain = {
    parent: _global,
    props: {
      '$keyA': 'domain A value',
      '$keyB': 'domain B value'
    }
  };

  var location = {
    parent: domain,
    props: {
      '$keyA': 'location A value',
      '$testStr': '"test string"',
      '$testStr1': '\'test string 1\''
    }
  };

  it('should use source value', function () {
    var input = '$keyA';
    var result = replaceVar(input, location);

    assert.equal(result, 'location A value');
  });

  it('should use source\'s parent value', function () {
    var input = '$keyB';
    var result = replaceVar(input, location);

    assert.equal(result, 'domain B value');
  });

  it('should use source\'s parent\'s parent value', function () {
    var input = '$keyC';
    var result = replaceVar(input, location);

    assert.equal(result, 'global C value');
  });

  it('should return `null` or `undefined` if str is `null` or `undefined`', function () {
    var resultNull = replaceVar(null, location);
    var resultUndefined = replaceVar(undefined, location);

    assert.equal(resultNull, null);
    assert.equal(resultUndefined, undefined);
  });

  it('should replace string wrightly', function () {
    var input = '$testStr';
    var input1 = '$testStr1';
    var result = replaceVar(input, location);
    var result1 = replaceVar(input1, location);

    assert.equal(result, 'test string');
    assert.equal(result1, 'test string 1');
  });

  it('should return var name if not matched', function () {
    var input = '$keyAAA';
    var result = replaceVar(input, location);

    assert.equal(result, '$keyAAA');
  });

  it('should replace all elements in Array', function () {
    var input = ['$keyA', '$keyB', '$keyC', undefined];
    var result = replaceVar(input, location);

    assert.deepEqual(result, ['location A value', 'domain B value', 'global C value', undefined]);
  });

  it('should replace all properties in Object', function () {
    var fun = function () {};
    var input = {
      'a': '$keyA',
      'b': '$keyB',
      'c': '$keyC',
      'd': undefined,
      'e': fun
    };
    var result = replaceVar(input, location);

    assert.deepEqual(result, {
      a: 'location A value',
      b: 'domain B value',
      c: 'global C value',
      d: undefined,
      e: fun
    });
  });
});

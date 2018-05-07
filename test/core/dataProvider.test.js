var assert = require('assert');
var hiproxy = require('../../src/index');
var dataProvider = hiproxy.dataProvider;

describe('# hiproxy.dataProvider', function () {
  describe('# get data store', function () {
    it('should get a store when call getData(namespace)', function () {
      var store = dataProvider.getData('test');
      assert.deepEqual({}, store);
    });

    it('should get a new store when call getData(namespace) with different namespace', function () {
      var store1 = dataProvider.getData('test1');
      var store2 = dataProvider.getData('test2');

      assert.notEqual(store1, store2);
    });

    it('should get a same store when call getData(namespace) with same namespace', function () {
      var store1 = dataProvider.getData('test1');
      var store2 = dataProvider.getData('test1');

      store1.set('k', 'v');

      assert.equal(store1, store2);
      assert.deepEqual(store1, store2);
      assert.equal('v', store2.get('k'));
    });
  });

  describe('# set value', function () {
    it('should set the value to the store', function () {
      var store = dataProvider.getData('test');

      store.set('k', 'v');
      store.set('k1', 'v1');

      assert.deepEqual({'k': 'v', 'k1': 'v1'}, store._data_);
    });

    it('should set `undefined` to the value when not specify the `value` param', function () {
      var store = dataProvider.getData('test1');

      store.set('k');

      assert.deepEqual({'k': undefined}, store._data_);
    });
  });

  describe('# get value', function () {
    it('should get ALL the value from store when call `get()` without params', function () {
      var store = dataProvider.getData('test3');

      store.set('k', 'v');
      store.set('k1', 'v1');

      assert.deepEqual({'k': 'v', 'k1': 'v1'}, store.get());
    });

    it('should get the specified key\'s value from store when call `get(key)`', function () {
      var store = dataProvider.getData('test4');

      store.set('num', 125);

      assert.equal(125, store.get('num'));
    });
  });
});

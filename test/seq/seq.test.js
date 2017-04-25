var Sequence = require('../../src/sequence');

var assert = require('assert');

describe('Sequence', function () {
  var seq = new Sequence();

  seq.use(
    '/group/',
    function fn1 (ctx, next) {
      console.log('fn1:', ctx);
      ctx.fn1 = true;
      next(null, { time: new Date() });
    },
    function fn11 (ctx, next) {
      console.log('fn11:', ctx);
      ctx.fn11 = true;
      next();
    }
  );

  seq.use(function fn2 (ctx, next) {
    console.log('fn2:', ctx);
    ctx.fn2 = true;
    next();
  });

  seq.use('/group/', function fn3 (ctx, next) {
    console.log('fn3:', ctx);
    ctx.fn3 = true;

    // next();
  });

  seq.use(function fn4 (ctx, next) {
    console.log('fn4:', ctx);
    ctx.fn4 = true;
  });

  describe('# run without filter param', function () {
    var ctx = {
      initialized: true
    };

    seq.run(ctx);

    it('# should run default functions', function () {
      assert.equal(ctx.fn2, true);
      assert.equal(ctx.fn4, true);
    });

    it('# should not run group functions', function () {
      assert.notEqual(ctx.fn1, true);
      assert.notEqual(ctx.fn11, true);
      assert.notEqual(ctx.fn3, true);
    });
  });

  describe('# run with filter param', function () {
    var ctx = {
      initialized: true
    };

    seq.run('/group/', ctx);

    it('# should run group functions', function () {
      assert.equal(ctx.fn1, true);
      assert.equal(ctx.fn11, true);
      assert.equal(ctx.fn3, true);
    });

    it('# should run every functions passed to `use()`', function () {
      assert.equal(ctx.fn1, true);
      assert.equal(ctx.fn11, true);
    });

    it('# should not run group functions', function () {
      assert.notEqual(ctx.fn2, true);
      assert.notEqual(ctx.fn4, true);
    });
  });
});

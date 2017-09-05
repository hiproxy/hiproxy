/**
 * @file hiproxy system router
 * @author zdying
 */
'use strict';

var router = require('./router');

module.exports = function (ctx, next) {
  var req = ctx.req;
  var res = ctx.res;
  var url = req.url.split('?')[0];
  var render = router.getRender(url);

  if (render) {
    render.call(this, req, res);
  } else {
    next();
  }
};

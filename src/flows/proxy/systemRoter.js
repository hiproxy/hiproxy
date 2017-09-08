/**
 * @file hiproxy system router
 * @author zdying
 */
'use strict';

var routers = require('../../routers');

module.exports = function (ctx, next) {
  var req = ctx.req;
  var res = ctx.res;
  var url = req.url.split('?')[0];
  var render = routers.getRender(url);
  var hiproxy = this;

  if (render) {
    render.call(hiproxy, req, res);
  } else {
    next();
  }
};

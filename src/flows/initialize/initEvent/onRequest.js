var proxyFlow = require('../../proxy');
module.exports = function (req, res) {
  proxyFlow.run({
    req: req,
    res: res,
    // hiproxy: hiproxy,
    logger: this.logger
  }, null, this);
};

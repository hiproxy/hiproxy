var commands = require('./commands');
var directives = require('./directives');
var routes = require('./routes');

module.exports = {
  // CLI commands
  commands: commands,

  // Rewrite config redirectives
  directives: directives,

  // HTTP server routes
  routes: routes
};

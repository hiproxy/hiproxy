module.exports = [
  {
    command: 'hello',
    describe: 'A test command that say hello to you.',
    usage: 'hello [--name <name>] [-xodD]',
    fn: function () {
      var cliArgs = this;

      console.log('Hi, welcome to use hiproxy example plugin');
      if (cliArgs.name) {
        console.log('your name is', cliArgs.name.green);
      }

      if (cliArgs.age) {
        console.log('your are', cliArgs.age.green, 'years old');
      }
    },
    options: {
      'name <name>': {
        alias: 'n',
        describe: 'your name'
      },
      'age': {
        alias: 'a',
        describe: 'your age'
      }
    }
  },
  {
    command: 'hi',
    describe: 'hi',
    usage: 'hi',
    fn: function () {}
  }
];

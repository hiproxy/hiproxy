/**
 * @file parse rewrite file to javascript object
 * @author zdying
 */

/**
 * Parse rewrite source file to AST tree
 * @param sourceCode
 * @param filePath
 * @returns {{}}
 */
module.exports = function parseRewrite (sourceCode, filePath) {
  var res = {
    baseRules: [],
    domains: [],
    commands: [],
    filePath: filePath
  };
  var target = res;
  var history = [];

  var pureContent = sourceCode.toString();

  pureContent = pureContent
        // 去掉注释
        .replace(/\s*#.*$/gm, '')
        // 去掉全部是空行
        .replace(/^\s+$/gm, '')
        // 将末尾的·}·换行
        .replace(/([^\s]+)\}$/gm, '$1\n}')
        // 将换行后的·;·取消换行
        .replace(/\n\r?\s*;\s*$/gm, ';');

    // console.log();
    // console.log(':::pureContent:::');
    // console.log(pureContent);

  var lines = pureContent.split(/\n\r?/);
  var regSpace = /\s+/g;
  var regs = {
    baseRule: /^(.*?\s*=>\s*[^\{\}]*)$/,
    cmd: /^(\w+(?:\s[^\{]+)+)$/,
        // rule: /(.*?\s*=>\s*\{[\s\S]*?\})/,
    domainStart: /^(([^\/]+) => \{)|(domain ([^\/]+) \{)$/,
    locationStart: /^location\s((~\s*)?\/.*?)+\s*\{$/,
    end: /^}$/
  };
    // 注意: 正则表达式是有顺序的, baseRule必须在cmd之前;

  lines.forEach(function (line, index) {
    line = line.trim().replace(/;\s*$/, '').replace(regSpace, ' ');
        // console.log((100 + index + '').slice(1), line);

    if (line === '') {
      return;
    }

    for (var type in regs) {
      if (regs[type].test(line)) {
        switch (type) {
          case 'cmd':
            var cmdObj = parseCommand(line);
            target.commands.push(cmdObj);
            break;

          case 'baseRule':
            target.baseRules.push(line);
            break;

          case 'domainStart':
            var domain = line.indexOf('domain') === 0
                            ? line.replace(/domain ([^\/]+) \{/, '$1')
                            : line.split(/\s*=>\s*/)[0];

            target.domains.push({
              domain: domain,
              commands: [],
              location: [],
              props: {}
            });
            history.push(target);
            target = target.domains[target.domains.length - 1];
            break;

          case 'locationStart':
            target.location.push({
              location: line.replace(/~\s*/, '~').split(' ')[1],
              commands: [],
              props: {}
            });
            history.push(target);
            target = target.location[target.location.length - 1];
            break;

          case 'end':
            target = history.pop();
            break;
        }

        break;
      }
    }
  });

    // console.log(JSON.stringify(res, null, 4));

  return res;
};

function parseCommand (command) {
  var array = command.split(/\s+/);
  return {
    name: array[0],
    params: array.slice(1)
  };
}

// test
// var fs = require('fs');
// var sourceCode = fs.readFileSync(__dirname + '/example/rewrite');
// var rules = module.exports(sourceCode);
// console.log();
// console.log(':::AST:::');
// console.log(JSON.stringify(rules, null, 4));

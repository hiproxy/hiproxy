/**
 * @file AST transform
 * @author zdying
 */

function Transform () {

}

Transform.prototype = {
  constructor: Transform,
  transform: function (AST) {
    var tree = this._transform(AST);

    this.mergeProps(tree);

    return this.flatten(tree);
  },

  _transform: function (AST, target) {
    if (
      !AST ||
      AST.type.indexOf('Block') === -1 ||
      !Array.isArray(AST.body) ||
      AST.body.length === 0
    ) {
      return null;
    }

    var body = AST.body;

    target = target || {};

    body.forEach(function (statement) {
      var type = statement.type;

      switch (type) {
        case 'SimpleRule':
          this.transformSimpleRule(target, statement);
          break;
        case 'CallExpression':
          this.transformCall(target, statement);
          break;
        case 'VariableDeclaration':
          this.transformSet(target, statement);
          break;
        case 'DomainBlock':
          this.transformDomain(target, statement);
          break;
        case 'LocationBlock':
          this.transformLocation(target, statement);
          break;
        default:

          break;
      }
    }, this);

    return target;
  },

  transformSimpleRule: function (target, statement) {
    var left = statement.left;
    var right = statement.right;
    var obj = {
      source: left.value,
      target: right.value
    };

    if (Array.isArray(target.baseRules)) {
      target.baseRules.push(obj);
    } else {
      target.baseRules = [obj];
    }
  },

  transformCall: function (target, statement) {
    var directive = statement.directive;
    var params = statement.arguments.map(function (param) {
      return param.value;
    });
    var obj = {
      directive: directive,
      arguments: params
    };

    if (Array.isArray(target.directives)) {
      target.directives.push(obj);
    } else {
      target.directives = [obj];
    }
  },

  transformDomain: function (target, statement) {
    var domain = {
      domain: statement.domain,
      directives: [],
      variables: {},
      locations: []
    };

    var obj = this._transform(statement, domain);

    if (Array.isArray(target.domains)) {
      target.domains.push(obj);
    } else {
      target.domains = [obj];
    }
  },

  transformLocation: function (target, statement) {
    var location = {
      location: statement.location,
      directives: [],
      variables: {}
    };

    var obj = this._transform(statement, location);

    if (Array.isArray(target.locations)) {
      target.locations.push(obj);
    } else {
      target.locations = [obj];
    }
  },

  transformSet: function (target, statement) {
    if (!target.variables) {
      target.variables = {};
    }

    var declaration = statement.declaration;
    var id = declaration.id.value;
    var value = declaration.value;

    if (value.length === 1) {
      value = value[0].value;
    } else {
      value = value.map(function (val) {
        return val.value;
      });
    }

    value = Transform.replaceVar(value, target.variables);

    target.variables[id] = value;
  },

  mergeProps: function (target) {
    var domains = target.domains || [];

    domains.forEach(function (domain) {
      // merge variables from `GlobalBlock`
      this.merge(domain, target);

      // replace variables
      domain.variables = Transform.replaceVar(domain.variables, domain.variables);
      Transform.replaceVar(domain, domain.variables, ['variables', 'locations']);

      domain.locations.forEach(function (location) {
        // merge variables from `DomainBlock`
        this.merge(location, domain);

        // replace variables
        location.variables = Transform.replaceVar(location.variables, location.variables);
        Transform.replaceVar(location, location.variables);
      }, this);
    }, this);
  },

  merge: function (current, parent) {
    ['directives', 'variables'].forEach(function (key) {
      var parentProps = parent[key];
      var currProps = current[key];
      var prop = '';

      if (!parentProps) {
        return;
      }

      currProps = currProps || (current[key] = (key === 'directives' ? {} : []));

      if (Array.isArray(parentProps)) {
        current[key] = parentProps.concat(currProps);
      } else if (typeof parentProps === 'object') {
        for (prop in parentProps) {
          if (!(prop in currProps)) {
            currProps[prop] = parentProps[prop];
          }
        }
      }
    });
  },

  flatten: function (tree, filePath) {
    var result = {};
    var variables = tree.variables || {};
    var domains = tree.domains || [];

    this.parseBaseRule(tree);

    domains.forEach(function (curr) {
      curr.domain = Transform.replaceVar(curr.domain, variables);
      // curr.filePath = filePath;
      result[curr.domain] = curr;
    }, this);

    return result;
  },

  parseBaseRule: function (tree) {
    // {
    //   "source": "http://api.hiproxy.org/",
    //   "target": "http://hiproxy.org/api/"
    // }

    var domains = tree.domains || [];
    var baseRules = tree.baseRules || [];

    baseRules.forEach(function (rule) {
      var arr = rule.source.split('//');
      var hostAndPath = (arr[1] || arr[0]).split('/');
      var path = hostAndPath[1] || '';
      var host = hostAndPath[0];

      var domain = {
        domain: host,
        directives: [],
        variables: {},
        locations: [
          {
            location: '/' + path,
            isBaseRule: true,
            variables: {
              proxy_pass: rule.target
            },
            directives: []
          }
        ]
      };

      domains.push(domain);
    });
  }
};

/**
* Replace variables in a value
*
* @param {String|Array|Object} str
* @param {Object} source
* @param {Array} [exclude]
* @returns {*}
*/
Transform.replaceVar = function (str, source, exclude) {
  if (str == null) {
    return str;
  }

  if (!Array.isArray(exclude)) {
    exclude = [];
  }

  var strType = typeof str;
  var replace = function (str) {
    if (typeof str !== 'string') {
      return Transform.replaceVar(str, source);
    }

    for (var key in source) {
      str = str.replace(new RegExp(key.replace('$', '\\$'), 'g'), source[key]);
    }
    return str;
  };

  if (strType === 'string') {
    str = replace(str);
  } else if (strType === 'array') {
    str = str.map(function (string) {
      return replace(string);
    });
  } else if (strType === 'object') {
    for (var strKey in str) {
      if (exclude.indexOf(strKey) === -1) {
        str[strKey] = replace(str[strKey]);
      }
    }
  }

  return str;
};

module.exports = Transform;

// var file = require('path').join(__dirname, 'test.txt');
// var source = require('fs').readFileSync(file, 'utf-8');
// var Parser = require('./parser.js');
// var parser = new Parser(source);
// var ast = parser.parseToplevel();

// var res = new Transform().transform(ast);

// console.log(JSON.stringify(res, null, 2));

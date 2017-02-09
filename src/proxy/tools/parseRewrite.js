/**
 * @file parse rewrite file to javascript object
 * @author zdying
 */
var fs = require('fs');
var AST = require('./../AST/AST');
var formatAST = require('./../AST/ASTFormater');

module.exports = function parseRewrite(filePath){
    var sourceCode = fs.readFileSync(filePath);
    var ASTTree = AST(sourceCode, filePath);
    var tree = formatAST(ASTTree);

    return tree
};
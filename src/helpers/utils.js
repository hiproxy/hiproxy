/**
 * @file
 * @author zdying
 */

var path = require('path');

module.exports = {
    getProjectTMPDIR: function(root){
        var projectName = this.getProjectName(root);
        var tmpDir = path.resolve(__hii__.codeTmpdir, projectName);

        log.debug('webpackConfig -', projectName.bold.green, 'tmp dir', root, tmpDir, __hii__.cwd, __hii__.originCwd);
        return tmpDir
    },

    getProjectName: function(root){
        if(__hii__.originCwd === root){
            return root.split(/[\\\/]/).pop()
        }

        var projectName = root
            .replace(__hii__.originCwd || __hii__.cwd, '')
            .replace(/^[\/\\]|[\/\\]$]/g, '');

        return projectName;
    }
};
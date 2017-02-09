/**
 * @file
 * @author zdying
 */

'use strict';

var fs = require('fs');

module.exports = {
    renderList: function(url, filePath, cbk){
        var promise = new Promise(function(resolve, reject){
            fs.readdir(filePath, function(err, files){
                if(err){
                    log.error(err);
                    reject(err.stack);
                    return
                }

                //TODO 这里需要考虑HTTPS
                // var hostPort = program.https ? 'https://127.0.0.1' : '//127.0.0.1' + program.port;
                var sourceUrl = /*hostPort + */'/__source__/image/';
                var docSVG = '<img class="file-icon" src="' + sourceUrl + 'Document.svg' + '"/>';
                var fileSVG = '<img class="file-icon" src="' + sourceUrl + 'File.svg' + '"/>';
                var folderSVG = '<img class="file-icon" src="' + sourceUrl + 'Folder.svg' + '"/>';

                var html = [
                    '<html>',
                    '<header>',
                    '<meta charset="utf-8">',
                    '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">',
                    '<style>',
                    'ul{ padding: 0; font-family: monospace; font-size: 14px; }',
                    'li{ list-style: none; margin: 5px; width: 195px; display: inline-block; color: #0077DD; }',
                    'li:hover{ color: #FF5522; }',
                    'a { padding: 15px 5px; display: block; color: #0077DD; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }',
                    'a:hover { color: #FF5522 }',
                    '.file-icon{ width: 36px; height: 36px; vertical-align: middle; margin: 0 10px 0 0; }',
                    '</style>',
                    '</header>',
                    '<body>',
                    '<ul>'
                ];
                html.push('<li>');
                html.push(      '<a href="', url.replace(/\/([^\\\/]*?)\/?$/, '/') , '">', folderSVG, '../</a>');
                html.push('</li>');

                var filesItem = files.map(function(fileName){
                    if(fileName.slice(0, 1) === '.'){
                        log.debug('hide system file/directory', fileName.bold);
                        // 不显示系统隐藏文件
                        return
                    }

                    var isFile = fs.statSync(filePath + '/' + fileName).isFile();

                    return [
                        '<li>',
                        '<a title="' + fileName + '" href="' + (isFile ? fileName : fileName + '/') + '">',
                        isFile ? (fileName.indexOf('.') === -1 ? fileSVG : docSVG) : folderSVG,
                        fileName,
                        '</a>',
                        '</li>'
                    ].join('')
                });

                html.push.apply(html, filesItem);
                html.push('</ul></body></html>');

                resolve(html.join(''));
            });
        });

        return promise
    }
};
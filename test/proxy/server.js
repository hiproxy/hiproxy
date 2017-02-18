var http = require('http');

this.server = http.createServer(function (req, res) {
    if(req.url === '/'){
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Hello, hiproxy');
    }else{
        var header = {'Content-Type': 'text/html'};

        for(var key in req.headers){
            header[key] = req.headers[key];
        }

        res.writeHead(200, header);
        res.end('GET ' + req.url + ' OK.');
    }
});

exports.listen = function () {
    this.server.listen.apply(this.server, arguments);
};

exports.close = function (callback) {
    this.server.close(callback);
};
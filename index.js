var http = require('http');
var WebHook = require('./lib/webhook');

var webhook = new WebHook({secret: process.env.SECRET_TOKEN});

webhook.on('error', function (error) {
    console.log(error.stack);
});

webhook.on('ping', function (payload) {
    console.log('Ping: ' + payload.zen);
});

webhook.on('push', function (payload) {
    //console.log(payload);
    console.log('push');
});

//console.log(secretToken);
var server = http.createServer(function (request, response) {
    //webhook.emit('name', payload);
    response.setHeader('Content-Type', 'text/html');
    webhook.handle(request);
    response.end('<h1>Bye</h1>');
});

server.listen(3000);

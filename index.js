var http = require('http');
var EventsWatcher = require('./lib/events-watcher');
var config = require('./config');

var watcher = new EventsWatcher(config.activityStreamUrl);

watcher.on('error', function (error) {
    console.log(error.stack);
});

watcher.on('push-event', function (event) {
    console.log('Oush: ', event.payload.commits);
});

watcher.start();

var http = require('http');
var config = require('./config');
var EventsWatcher = require('./lib/events-watcher');
var Commit = require('./lib/commit');
var FilesModel = require('./lib/status-watcher');

var filesModel = new FilesModel({
    tree: './iojs-ru/docs/*.md',
    statuses: './iojs-ru/statuses/status.json'
});

var watcher = new EventsWatcher(config.activityStreamUrl);

watcher.on('error', function (error) {
    console.log(error.stack);
});

watcher.on('push-event', function (event) {
    //console.log('Oush: ', event.payload.commits);
    event.payload.commits.forEach(function (commit) {
        var c = new Commit(commit.url);
        filesModel.pushChange(c);
    });
    //var commit = new Commit(event.payload.)
});

watcher.start();

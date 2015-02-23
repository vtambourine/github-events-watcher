var events = require('events');
var http = require('http');
var https = require('https');
var url = require('url');

class EventWatcher extends events.EventEmitter {
    constructor(url) {
        if (typeof url === 'string') {
            this._url = url;
            this._looper = null;
            this._etag = '';
        } else {
            throw new Error('Invalid GitHub events URL.');
        }
    }

    watch() {
        this.stop();
        // make request
        this._request();

        // set timeout
    }

    stop() {
        if (this._looper) {
            clearTimeout(this._looper);
        }
    }

    _request() {
        var options = url.parse(this._url);
        options.headers = {
            'User-Agent': 'Benjamin Tambourine',
            'If-None-Match': this._etag
        };
        https.get(options, this._onGetRequest.bind(this));
    }

    _onGetRequest(response) {
        var buffers = [];
        var statusCode = response.statusCode;
        var headers = response.headers;
        var ratelimitRemaining = parseInt(headers['x-ratelimit-remaining']);
        var ratelimitReset = parseInt(headers['x-ratelimit-reset']);
        var pollInterval = parseInt(headers['x-poll-interval'])
            || parseInt((headers['cache-control'].match(/max-age=(\d+)/) || [])[1])
            || 60;
        console.log(Date(), statusCode);
        var etag = headers.etag;
        if (ratelimitRemaining === 0) {
            this._createDelayedRequest(ratelimitReset * 1000 - Date.now());
        } else if (statusCode === 304) {
            this._etag = etag;
            this._createDelayedRequest(pollInterval * 100);
        } else if (statusCode === 200) {
            this._etag = etag;
            response.on('data', function (chunk) {
                buffers.push(chunk);
            });
            response.on('end', function () {
                var body = Buffer.concat(buffers).toString();
                try {
                    var data = JSON.parse(body);
                    data.forEach(this._processEvent, this);
                } catch (error) {
                    this.emit('error', new Error('Response parsing error.'));
                }
                this._createDelayedRequest(pollInterval * 100);
            }.bind(this));
        } else {
            this.emit('error', new Error('Polling request error.'));
        }
    }

    _createDelayedRequest(timeout) {
        this.stop();
        this._looper = setTimeout(this._request.bind(this), timeout);
    }

    _processEvent(event) {
        var eventName = event.type.replace(/([A-Z])/g, ' $1').trim().split(' ').join('-').toLowerCase();
        this.emit(eventName, event);
    }
}

var watcher = new EventWatcher('https://api.github.com/repos/vtambourine/io.js/events');

watcher.watch();

var events = require('events');
var https = require('https');
var url = require('url');

/**
 * Emitter over GitHub activity stream events.
 * Performs cascade of requests to specified activity stream
 * and converts received events description into JavaScript events.
 *
 * @example
 * var watcher = new EventWatcher('https://api.github.com/repos/vtambourine/io.js/events');
 * watcher.watch();
 * watcher.on('push', onPushHandler);
 *
 * @class EventsWatcher
 */
class EventsWatcher extends events.EventEmitter {
    /**
     * GitHub event.
     * Name of the event is always dash-typed.
     * @see https://developer.github.com/v3/activity/events/types
     *
     * @event EventWatcher#<name>
     * @type {Object}
     */

    /**
     * Error while processing request.
     *
     * @event EventWatcher#error
     * @type {Error}
     */

    /**
     * @constructs
     * @param {String} url Activity stream URL.
     */
    constructor(url) {
        if (typeof url === 'string') {
            this._url = url;
            this._looper = null;
            this._etag = '';
        } else {
            throw new Error('Invalid GitHub events URL.');
        }
    }

    /**
     * Start watching activity stream.
     */
    watch() {
        this._createDelayedRequest(0);
    }

    /**
     * Stop watching activity stream.
     */
    stop() {
        if (this._looper) {
            clearTimeout(this._looper);
        }
    }

    /**
     * Make a single request for new events.
     * @private
     */
    _request() {
        var options = url.parse(this._url);
        options.headers = {
            'User-Agent': 'Benjamin Tambourine',
            'If-None-Match': this._etag
        };
        https.get(options, this._onResponse.bind(this));
    }

    /**
     * Response handler.
     *
     * @param {http.IncomingMessage} response
     * @private
     */
    _onResponse(response) {
        var buffers = [];
        var statusCode = response.statusCode;
        var headers = response.headers;
        var ratelimitRemaining = parseInt(headers['x-ratelimit-remaining']);
        var ratelimitReset = parseInt(headers['x-ratelimit-reset']);
        var pollInterval = parseInt(headers['x-poll-interval'])
            || parseInt((headers['cache-control'].match(/max-age=(\d+)/) || [])[1])
            || 60;
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
            this.emit('error', new Error('Polling request error. Status code: ' + statusCode));
        }
    }

    /**
     * Creates subsequent request for polling sequence.
     *
     * @param {Number} timeout
     * @private
     */
    _createDelayedRequest(timeout) {
        this.stop();
        this._looper = setTimeout(this._request.bind(this), timeout);
    }

    /**
     * Converts GitHub event information into JavaScript event.
     *
     * @param {Object} event
     * @private
     */
    _processEvent(event) {
        var eventName = event.type.replace(/([A-Z])/g, ' $1').trim().split(' ').join('-').toLowerCase();
        this.emit(eventName, event);
    }
}

module.exports = EventsWatcher;

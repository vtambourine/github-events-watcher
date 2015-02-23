var events = require('events');
var crypto = require('crypto');

class WebhookEmitter extends events.EventEmitter {
    /**
     * @event WebhookEmitter#<name>
     */

    /**
     * @event WebhookEmitter#error
     */

    /**
     * @param {Object} options
     * @param {String} [options.secret] Secret token.
     */
    constructor(options) {
        options = options || {};
        this._secret = options.secret;
    }

    /**
     * Handle GitHub Webhook request.
     *
     * @param {http.IncomingMessage} request
     */
    handle(request) {
        if (request.method === 'POST') {
            var buffers = [];
            request.on('data', function (chunk) {
                buffers.push(chunk);
            });
            request.on('end', function () {
                var body = Buffer.concat(buffers).toString();
                var signature = request.headers['x-hub-signature'];
                if (this._verifySignature(body, signature)) {
                    var event = request.headers['x-github-event'];
                    try {
                        var payload = JSON.parse(body);
                        this.emit(event, payload);
                    } catch (error) {
                        this.emit('error', new Error('Error in parsing request: ' + error.message));
                    }
                } else {
                    this.emit('error', new Error('Signature didn\'t match!'));
                }
            }.bind(this));
        }
    }

    /**
     * Ensure data signature matches secret key.
     *
     * @param {String} data
     * @param {String} signature
     * @returns {Boolean}
     * @private
     */
    _verifySignature(data, signature) {
        if (this._secret) {
            var sha = crypto.createHmac('sha1', this._secret).update(data).digest('hex');
            var dataSignature = 'sha1=' + sha;
            console.log(data);
            console.log(data.length);
            if (dataSignature === signature) {
                return true
            }
        }
        return false;
    }
}

module.exports = WebhookEmitter;

var events = require('events');
var fs = require('fs');

/**
 * @typedef {Object} StatusChangeEvent
 * @property {String} filename
 * @property {String} hash
 * @property {Date} date
 */

/**
 * @class VersionWatcher
 */
class VersionWatcher extends events.EventEmitter {
    /**
     * @event VersionWatcher#change
     * @type {StatusChangeEvent}
     */

    /**
     * @param options
     */
    constructor(options) {
        this._source = options.source;
        this._promise = null;
        this._versionPromises = [];
        this._prepare();
    }

    _prepare() {
        return this._promise = new Promise((resolve, reject) => {
            fs.access(this._source, fs.R_OK, (error) => {
                if (error) {
                    return reject(error);
                }
                var sourceFiles = fs.readdir(this._source, (error, files) => {
                    if (error) {
                        return reject(error);
                    }
                    this._versionPromises = files.map((file) => {
                        return this._getFileVersion(file);
                    })
                });
            });
        });
    }

    /**
     * @param {Commit} commit
     */
    pushChange(commit) {
        commit.getChangedFiles().then(function (files) {

        });
    }

    _getFileVersion(filename) {
        return new Promise(() => {
            
        })
    }
}

module.exports = VersionWatcher;

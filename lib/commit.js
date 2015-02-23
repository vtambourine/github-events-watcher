var https = require('https');
var url = require('url');

class Commit {
    constructor(commitUrl) {
        this._data = null;
        this._dataPromise = null;
        this.getCommitData(commitUrl);
    }

    getCommitData(commitUrl) {
        this._dataPromise = new Promise(function (resolve, reject) {
            var options = url.parse(commitUrl);
            options.headers = {
                'User-Agent': 'Benjamin Tambourine'
            };
            https.get(options, function (response) {
                var buffers = [];
                response.on('data', buffers.push);
                response.on('end', function () {
                    var body = Buffer.concat(buffers).toString();
                    var data = JSON.parse(body);
                    this._data = data;
                }.bind(this));
            }.bind(this));
        }.bind(this));
    }

    getChangedFiles() {
        return this._dataPromise.then(function () {
            return this._data.files;
        })
    }
}

module.exports = Commit;

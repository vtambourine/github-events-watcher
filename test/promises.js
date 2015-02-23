class SampleCase {
    constructor() {
        this._name = 'Bob';
        this.getData();
    }

    getData() {
        this._promise = new Promise(function (resolve, reject) {
            setTimeout(function () {
                this._name = 'John';
                resolve();
            }.bind(this), 1500);
        }.bind(this));
    }

    getName() {
        //return Promise.all(this._promise);
        return this._promise.then(function () {
            return this._name;
        }.bind(this));
    }
}

var sc = new SampleCase();
console.log(sc._name);

var name = sc.getName();
//console.log('value', name.isFulfilled());
console.log(name instanceof Promise);

sc.getName().then(console.log);

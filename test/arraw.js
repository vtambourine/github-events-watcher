console.log('Papa');

class Test {
    constructor() {
        this.promise = null;
        this.name = 'Alex';
        this.prepare();
        console.log('++++++++++++');
        console.log(this);
    }

    prepare() {
        if (this.promise) {
            return this.promise;
        }
        return this.promise = new Promise((resolve, reject) => {
            setTimeout(() => {

                console.log('o o o o o ');
                console.log(this);
                this.name = "Bob";
                resolve();
            }, 500);
        });
    }

    getName() {
        console.log('==========');
        console.log(this);
        return this.promise.then(() => {
            console.log('==========');
            console.log(this);
            return this.name;
        }.bind(this));
    }
}

var t = new Test();
t.getName().then(console.log, function (error) {
    console.log(error.stack);
});

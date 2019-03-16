var Promise = require('bluebird');
exports.EventEmitterPromisifier = function (originalMethod) {
    // return a function
    return function promisified() {
        var args = [].slice.call(arguments);
        // Needed so that the original method can be called with the correct receiver
        var self = this;
        // which returns a promise
        return new Promise(function (resolve, reject) {
            // We call the originalMethod here because if it throws,
            // it will reject the returned promise with the thrown error
            var emitter = originalMethod.apply(self, args);
            
            emitter
                .on("success", function (data, response) {
                resolve([data, response]);
            })
                .on("fail", function (data, response) {
                // Erroneous response like 400
                resolve([data, response]);
            })
                .on("error", function (err) {
                reject(err);
            })
                .on("abort", function () {
                reject(new Promise.CancellationError());
            })
                .on("timeout", function () {
                reject(new Promise.TimeoutError());
            });
        });
    };
};
exports.methodNamesToPromisify = "get post put del head patch json postJson putJson".split(" ");

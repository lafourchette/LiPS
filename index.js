"use strict";

exports.create = function(options) {

    var implementation;
    if(options) {
        if(options.implementation) {
            try {
                implementation = require('./lips-modules/'+options.implementation+'/index.js');
            } catch(err) {
                console.error(err);
            }
        }

        if(typeof options.parser !== "undefined") {
            assert.ok(typeof options.parser === "function", 'the parser should be a function');
        }

        if(implementation) {
            return implementation.create(options.parser);
        }
    }


}
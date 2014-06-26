"use strict";

var assert = require('assert');

/**
 * Returns a LiPS implementation as a new instance of {@link LipsImplementation}
 *
 * @param {object} options
 * @param {String} options.implementation
 * @param {Function} [options.parser]
 * @param {object} [options.config]
 * @returns {SpecificLipsImplementation}
 */
function create(options) {

    var implementationModule;
    if(options) {
        if(options.implementation) {
            try {
                implementationModule = require('./lips-modules/'+options.implementation+'/index.js');
            } catch(err) {
                console.error(err);
            }
        }

        if(typeof options.parser !== "undefined") {
            assert.ok(typeof options.parser === "function", 'the parser should be a function');
        }

        if(implementationModule) {
            return implementationModule.create(options.parser);
        }
    } else {
        console.error('options argument needs to be an object');
    }

}

/**
 * @exports index
 * @property {Function} create
 */
exports.create = create;
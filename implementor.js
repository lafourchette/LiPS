"use strict";

var util = require('util');
var assert = require('assert');

var LipsImplementation = require('./LipsImplementation.js');

/**
 *
 * @param {Function} listen
 * @param {Function} [implementationParser]
 * @returns {SpecificLipsImplementation}
 */
function createImplementation(listen ,implementationParser) {

    //TODO: assertions
    assert(typeof listen === "function", 'listenerInstallation should be a function');

    /**
     * @inheritDoc LipsImplementation
     * @constructor
     */
    function SpecificLipsImplementation() {
        LipsImplementation.apply(this, arguments);
    }
    util.inherits(SpecificLipsImplementation, LipsImplementation);
    if(implementationParser && typeof implementationParser === "function") {
        SpecificLipsImplementation.prototype.parser = implementationParser;
    }
    SpecificLipsImplementation.prototype.listen = listen;


    return SpecificLipsImplementation;
}

/**
 * @exports implementor
 * @property {Function} createImplementation
 */
exports.createImplementation = createImplementation;
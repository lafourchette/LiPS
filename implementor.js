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
function createImplementation(addListener, removeListener, implementationParser) {

    //TODO: assertions
    assert(typeof addListener === "function", 'addListener should be a function');
    assert(typeof removeListener === "function", 'removeListener should be a function');

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
    SpecificLipsImplementation.prototype.addListener = addListener;
    SpecificLipsImplementation.prototype.removeListener = removeListener;

    return SpecificLipsImplementation;
}

/**
 * @exports implementor
 * @property {Function} createImplementation
 */
exports.createImplementation = createImplementation;
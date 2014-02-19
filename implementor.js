"use strict";

var util = require('util');


/**
 *
 * @param {object} [options]
 * @param {Function} [options.parser]
 * @constructor
 */
function LipsImplementation(options) {
    if(options) {
        if(options.parser) {
            this.parser = options.parser;
        }
    }

    this._events = {};
}

LipsImplementation._increment = 0;

/**
 *
 * @param {*} content
 * @returns {*}
 */
LipsImplementation.prototype.parser = function(content) {
    return content;
};

/**
 *
 * @param {object} eventOptions
 * @param {Function} callback
 * @returns {Function} disable the listener
 */
LipsImplementation.prototype.on = function(eventOptions, callback) {
    this.listen(eventOptions, this.parser, callback);

    var currentIncrement = LipsImplementation._increment;

    this._events[currentIncrement] = {
        eventOptions: eventOptions,
        callback: callback
    };
    LipsImplementation._increment++;

    var self = this;

    return function off() {
        delete self._events[currentIncrement];
    };
};

/**
 *
 * @param {Function} listen
 * @param {Function} [implementationParser]
 * @returns {SpecificLipsImplementation}
 */
function createImplementation(listen ,implementationParser) {

    //TODO: assertions
    assert.ok(typeof listen === "function", 'listenerInstallation should be a function');

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

exports.createImplementation = createImplementation;
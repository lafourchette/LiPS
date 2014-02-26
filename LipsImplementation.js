"use strict";


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
    this._increment = 0;
}

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

    var currentIncrement = this._increment;

    this._events[currentIncrement] = {
        eventOptions: eventOptions,
        callback: callback
    };
    this._increment++;

    var self = this;

    return function off() {
        delete self._events[currentIncrement];
    };
};

module.exports = LipsImplementation;
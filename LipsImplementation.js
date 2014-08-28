"use strict";

/**
 *
 * @param {object} [options]
 * @param {Function} [options.parser]
 *
 * @alias module:lips.LipsImplementation
 * @constructor
 */
function LipsImplementation(options) {
    if(options) {
        if(typeof options.parser === 'function') {
            this.parser = options.parser;
        }
    }

    this._events = {};
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
    var listener = this.addListener(eventOptions, this.parser, callback);

    var self = this;

    return function off() {
        self.removeListener(listener, eventOptions, self.parser, callback);
    };
};

module.exports = LipsImplementation;
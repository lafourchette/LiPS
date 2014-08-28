/**
 * @module socketIO-lips
 */

"use strict";

var assert = require('assert');
var implementor = require('../../implementor.js');
var Listener = require('./Listener');

var Implementation = implementor.createImplementation(addListener, removeListener);


/**
 * socket.io-lips specific addListener function
 *
 * @param {object} eventOptions
 *
 * @param {Function} [parser]
 * @param {Function} callback
 */
function addListener(eventOptions, parser, callback) {

    assert(typeof eventOptions === "object" && eventOptions, 'event options should be an object');

    var listener = new Listener(eventOptions, parser, callback);

    return listener;
}

/**
 * socket.io specific removeListener function
 *
 * @param {AMQPLipsListener} listener
 */
function removeListener(listener) {
    if(listener) {
        listener.remove();
    }
}


/**
 * Instantiate the implementation
 *
 * @param parser
 * @returns {Implementation}
 */
function create(parser) {
    return new Implementation({
        parser: parser
    });
}

module.exports = {
    create: create,
    _addListener: addListener
};
/**
 * @module mysql-lips
 */

"use strict";

var assert = require('assert');
var implementor = require('../../implementor.js');
var Listener = require('./Listener');
var mysql = require('mysql');

var Implementation = implementor.createImplementation(addListener, removeListener);


/**
 * file-lips specific addListener function
 *
 * @param {object} eventOptions
 * @param {String} eventOptions.filepath
 * @param {String} eventOptions.readingMethod ('append', 'new')
 * @param {String} [eventOptions.fileEncoding = 'utf8']
 * @param {Function} [parser]
 * @param {Function} callback
 */
function addListener(eventOptions, parser, callback) {

    assert(typeof eventOptions === "object" && eventOptions, 'event options should be an object');
    assert(eventOptions.filepath, 'dirname should be provided and not be empty');
    assert(eventOptions.config, 'connection config should be provided and not be empty');
    assert(eventOptions.table, 'table should be provided and not be empty');
    assert(eventOptions.eventType, 'eventType should be provided and not be empty, event can be "(BEFORE|AFTER) (INSERT|UPDATE|DELETE)"');
    assert(eventOptions.eventName, '@TODO:to change its name');

    var listener = new Listener(eventOptions, parser, callback);
    listener.createTrigger();
    listener.initWatcher();

    return listener;
}

/**
 * file-lips specific removeListener function
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


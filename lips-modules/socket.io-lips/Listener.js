"use strict";


var fs = require('fs');
var path = require('path');
var ioClient = require('socket.io-client');

/**
 *
 * @param {object} eventOptions
 * @param {string} eventOptions.host
 * @param {number} eventOptions.post
 * @param {string} eventOptions.eventName
 * @param {Function} parser
 * @param {Function} callback
 * @constructor
 */
function Listener(eventOptions, parser, callback) {
    this.eventOptions = eventOptions;
    this.parser = parser;
    this.callback = callback;
    this.inc = 0;
    this.init();
}

/**
 * Initialization, called in constructor
 */
Listener.prototype.init = function() {
    console.log('CLIENT', 'init');
    this.io = ioClient(this.eventOptions.host + ':' + this.eventOptions.port);
    this.io.on(this.eventOptions.eventName, function(message) {
        console.log('CLIENT', 'MESSAGE', message);
    });
};

/**
 * Close the watcher and remove the pointer avoiding memory leaks
 *
 * @returns {boolean}
 */
Listener.prototype.remove = function() {
    if(this.io) {
        this.io.disconnect();
        this.io = null;
    }
};


module.exports = Listener;
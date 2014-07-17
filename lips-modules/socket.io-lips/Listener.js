"use strict";


var fs = require('fs');
var path = require('path');
var ioClient = require('socket.io-client');

/**
 *
 * @param {object} eventOptions
 * @param {string} eventOptions.host
 * @param {number} eventOptions.port
 * @param {string} eventOptions.eventName
 * @param {Function} parser
 * @param {Function} callback
 * @constructor
 */
function Listener(eventOptions, parser, callback) {
    this.eventOptions = eventOptions;
    this.parser = parser;
    this.callback = callback;
    this.init();
}

/**
 * Initialization, called in constructor
 */
Listener.prototype.init = function() {
    this.io = ioClient(this.eventOptions.host + ':' + this.eventOptions.port);
    this.io.on(this.eventOptions.eventName, this._parseData.bind(this));
};

/**
 * Parse data and call callback
 * @param data
 * @private
 */
Listener.prototype._parseData = function(data) {
    var parsedData;
    try {
        parsedData = this.parser(data);
    } catch (parsingError) {
        this.callback(new Error('parsing error'));
        return ;
    }
    this.callback(null, parsedData);
}

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
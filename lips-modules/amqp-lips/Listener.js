"use strict";


var fs = require('fs');
var path = require('path');
var amqp = require('amqp');

/**
 *
 * @param {object} eventOptions
 * @param {string} eventOptions.host
 * @param {number} eventOptions.port
 * @param {string} eventOptions.login
 * @param {string} eventOptions.password
 * @param {string} eventOptions.vhost
 * @param {string} eventOptions.queueName
 * @param {string} eventOptions.autoDelete
 * @param {string} eventOptions.durable
 * @param {string} eventOptions.exclusive
 * @param {Function} parser
 * @param {Function} callback
 * @alias module:amqp-lips.AMQPLipsListener
 * @constructor
 */
function AMQPLipsListener(eventOptions, parser, callback) {
    this.eventOptions = eventOptions;
    this.parser = parser;
    this.callback = callback;
    this.init();
}

/**
 * Initialization, called in constructor
 */
AMQPLipsListener.prototype.init = function() {
    this.connection = amqp.createConnection({
        host: this.eventOptions.host,
        port: this.eventOptions.port,
        login: this.eventOptions.login,
        password: this.eventOptions.password,
        vhost: this.eventOptions.vhost
    }, {defaultExchangeName: "amq.topic"});
    this.connection.on('ready', this._createQueue.bind(this));
};

/**
 * Create Queue
 */
AMQPLipsListener.prototype._createQueue = function () {
    // Use the default 'amq.topic' exchange

    this.connection.queue(this.eventOptions.queueName, {
        autoDelete: this.eventOptions.autoDelete,
        durable: this.eventOptions.durable,
        exclusive: this.eventOptions.exclusive
    }, this._bindQueue.bind(this));
};

/**
 * Bind queue and subscribe into it
 * @param {Queue} q
 */
AMQPLipsListener.prototype._bindQueue = function (q) {
    var self = this;
    this.queue = q;
    // Catch all messages
    q.bind('');

    // Receive messages
    q.subscribe(function (message) {
        self._parseData(message);
    });
};

/**
 * Parse data and call callback
 * @param data
 * @private
 */
AMQPLipsListener.prototype._parseData = function(data) {
    var parsedData;
    try {
        parsedData = this.parser(data);
    } catch (parsingError) {
        this.callback(new Error('parsing error'));
        return ;
    }
    this.callback(null, parsedData);
};

/**
 * Close the watcher and remove the pointer avoiding memory leaks
 *
 * @returns {boolean}
 */
AMQPLipsListener.prototype.remove = function() {
    this.queue.unbind('');
};


module.exports = AMQPLipsListener;
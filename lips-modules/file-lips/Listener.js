"use strict";


var fs = require('fs');
var path = require('path');

/**
 *
 * @param {object} eventOptions
 * @param {Function} parser
 * @param {Function} callback
 * @constructor
 */
function Listener(eventOptions, parser, callback) {
    this.eventOptions = eventOptions;
    this.parser = parser;
    this.callback = callback;
    this.watcher = null;
    this.inc = 0;
    this.init();
}

/**
 * Initialization, called in constructor
 */
Listener.prototype.init = function() {
    if(this.eventOptions) {
        this.fileEncoding = this.eventOptions.fileEncoding;
        if(!this.fileEncoding || this.fileEncoding.constructor !== String) {
            this.fileEncoding = this.eventOptions.fileEncoding = 'utf8';
        }
        switch(this.eventOptions.readingMethod) {
            case 'append':
                this.appendListener();
                break;
            case 'new':
                this.newListener();
                break;
            default:
                throw new Error('unrecognized eventOptions.readingMethod: ' + this.eventOptions.readingMethod);
        }
    }
};

/**
 * Close the watcher and remove the pointer avoiding memory leaks
 *
 * @returns {boolean}
 */
Listener.prototype.remove = function() {
    if(this.watcher) {
        this.watcher.close();
        this.watcher = null;
        return true;
    } else {
        return false;
    }
};

/**
 * Creates the file watcher for readingMethod 'append'
 * - watches the whole directory
 * - compare change event filename with provided basepath
 * - create readStream starting at an incremented cursor
 * - calls the provided callback with the parsed appended chunk of data
 */
Listener.prototype.appendListener = function() {
    var self = this;

    var basepath = this.eventOptions.filepath;
    var dirname = path.dirname(basepath);

    fs.stat(basepath, function(err, data) {
        self.inc = data.size - 1;
    });

    this.watcher = fs.watch(dirname);

    this.watcher.on('change', function(event, filename) {
        self._appendedFileWatcher(event, filename);
    });
};

/**
 * Handle appended file watcher change event
 *
 * @param event
 * @param {string} filename
 * @private
 */
Listener.prototype._appendedFileWatcher = function(event, filename) {
    var self = this;

    var basepath = this.eventOptions.filepath;
    var basename = path.basename(basepath);

    if(filename == basename) {
        var stream = fs.createReadStream(basepath, {encoding: this.fileEncoding, autoClose: false, start: this.inc});
        stream.on('data', function(data) {
            self._appendFileReadStreamOnData(data);
        });
    }
};

/**
 * Handle the read stream data
 *
 * @param data
 * @private
 */
Listener.prototype._appendFileReadStreamOnData = function(data) {
    data = data.slice(0, -1);
    var parsedData;
    try {
        parsedData = this.parser(data);
    } catch (parsingError) {
        this.callback(new Error('parsing error'));
        return;
    }
    this.callback(null, parsedData);
    this.inc += data.length;
};


/**
 * Creates the file watcher for readingMethod 'new'
 * - watches the whole directory
 * - compare change event filename with provided basepath
 * - reads the while file
 * - calls the provided callback with the parsed file content
 */
Listener.prototype.newListener = function() {
    var self = this;

    var basepath = this.eventOptions.filepath;
    var dirname = path.dirname(basepath);

    this.watcher = fs.watch(dirname);

    this.watcher.on('change', function(event, filename) {
        self._newFileWatcher(event, filename);
    });
};

/**
 * Handle new file watcher change event
 *
 * @param event
 * @param {string} filename
 * @private
 */
Listener.prototype._newFileWatcher = function(event, filename) {
    var self = this;

    var basepath = this.eventOptions.filepath;
    var basename = path.basename(basepath);

    if(filename == basename) {
        fs.readFile(basepath, self.fileEncoding, function(err, data) {
            self._newFileReadFileCallback(err, data);
        });
    }
};

/**
 * Handle the whole read file content
 *
 * @param err
 * @param data
 * @private
 */
Listener.prototype._newFileReadFileCallback = function(err, data) {
    if(err) {
        this.callback(err);
    } else {
        var parsedData;
        try {
            parsedData = this.parser(data);
        } catch (parsingError) {
            this.callback(new Error('parsing error'));
            return ;
        }
        this.callback(null, parsedData);
    }
};

module.exports = Listener;
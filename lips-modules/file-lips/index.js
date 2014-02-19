"use strict";


var fs = require('fs');
var assert = require('assert');
var path = require('path');

var implementor = require('../../implementor.js');

var Implementation = implementor.createImplementation(listen);

/**
 * file-lips specific listen function
 *
 * @param {object} eventOptions
 * @param {String} eventOptions.filepath
 * @param {String} eventOptions.readingMethod ('append', 'new')
 * @param {String} [eventOptions.fileEncoding = 'utf8']
 * @param {Function} [parser]
 * @param
 * @param callback
 */
function listen(eventOptions, parser, callback) {

    assert(typeof eventOptions === "object" && eventOptions, 'event options should be an object');
    assert(eventOptions.filepath, 'filepath should be provided and not be empty');

    var watcher;

    if(eventOptions) {
        var fileEncoding = eventOptions.fileEncoding;
        if(!fileEncoding || fileEncoding.constructor !== String) {
            fileEncoding = eventOptions.fileEncoding = 'utf8';
        }
        switch(eventOptions.readingMethod) {
            case 'append':
                watcher = appendListener(eventOptions.filepath, fileEncoding, parser, callback);
                break;
            case 'new':
                watcher = newListener(eventOptions.filepath, fileEncoding, parser, callback);
                break;
            default:
                throw new Error('unrecognized eventOptions.readingMethod: ' + eventOptions.readingMethod);
        }
    }

    if(watcher) {
        return function unwatch() {
            watcher.close();
        };
    }
}

/**
 * Creates the file watcher for readingMethod 'append'
 * - watches the whole directory
 * - compare change event filename with provided basepath
 * - create readStream starting at an incremented cursor
 * - calls the provided callback with the parsed appended chunk of data
 *
 * @param {String} basepath
 * @param {String} fileEncoding
 * @param {Function} parser
 * @param {Function} callback
 * @returns {FSWatcher}
 */
function appendListener(basepath, fileEncoding, parser, callback) {
    var basename = path.basename(basepath);
    var dirname = path.dirname(basepath);

    var inc = 0;
    fs.stat(basepath, function(err, data) {
        inc = data.size - 1;
    });

    var watcher = fs.watch(dirname);

    watcher.on('change', function(event, filename) {
        if(filename == basename) {
            var stream = fs.createReadStream(basepath, {encoding: fileEncoding, autoClose: false, start: inc});
            stream.on('data', function(data) {
                data = data.slice(0, -1);
                var parsedData;
                try {
                    parsedData = parser(data);
                } catch (parsingError) {
                    callback(new Error('parsing error'));
                }
                callback(null, parsedData);
                inc += data.length;
            });
        }
    });

    return watcher;
}


/**
 * Creates the file watcher for readingMethod 'new'
 * - watches the whole directory
 * - compare change event filename with provided basepath
 * - reads the while file
 * - calls the provided callback with the parsed file content
 *
 * @param {String} basepath
 * @param {String} fileEncoding
 * @param {Function} parser
 * @param {Function} callback
 * @returns {FSWatcher}
 */
function newListener(basepath, fileEncoding, parser, callback) {
    var basename = path.basename(basepath);
    var dirname = path.dirname(basepath);

    var watcher = fs.watch(dirname);

    fs.watch(dirname).on('change', function(event, filename) {

        if(filename == basename) {
            fs.readFile(basepath, fileEncoding, function(err, data) {
                if(err) {
                    callback(err);
                } else {
                    var parsedData;
                    try {
                        parsedData = parser(data);
                    } catch (parsingError) {
                        callback(new Error('parsing error'));
                    }
                    callback(null, parsedData);
                }
            });
        }
    });

    return watcher;
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
    _newListener: newListener,
    _appendListener: appendListener,
    _listen: listen
};


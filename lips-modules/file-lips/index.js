"use strict";


var fs = require('fs');

var implementor = require('../../implementor.js');

var Implementation = implementor.createImplementation();


function listen(eventOptions, parser, callback) {
    assert(typeof eventOptions === "object" && eventOptions, 'event options should be an object');
    assert(eventOptions.filepath, 'filepath should be provided and not be empty');


    if(eventOptions) {
        fs.watchFile(eventOptions.filepath, function(current, previous) {
            //TODO: readFile or createReadStream depending on instance configuration
        });
    }
}

function create(parser) {

    return new Implementation(listen, parser);

}

exports.create = create;
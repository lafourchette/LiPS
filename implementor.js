"use strict";

var util = require('util');


function LipsImplementation(options) {
    if(options) {
        if(options.parser) {
            this.parser = options.parser;
        }
    }
}

LipsImplementation.prototype.parser = function(content) {
    return content;
};

LipsImplementation.prototype.on = function(eventOptions, callback) {
    this.listen(eventOptions, this.parser, callback);
};


function createImplementation(listen ,implementationParser) {

    //TODO: assertions
    assert.ok(typeof listen === "function", 'listenerInstallation should be a function');

    function SpecificLipsImplementation() {
        LipsImplementation.apply(this, arguments);
    }
    util.inherits(SpecificLipsImplementation, LipsImplementation);
    if(implementationParser && typeof implementationParser === "function") {
        SpecificLipsImplementation.prototype.parser = implementationParser;
    }
    SpecificLipsImplementation.prototype.listen = listen;


    return SpecificLipsImplementation;

}

exports.createImplementation = createImplementation;
"use strict";

var implementor = require('../../implementor.js');

var Implementation = implementor.createImplementation();

function create(parser) {

    return new Implementation(parser);

}

exports.create = create;
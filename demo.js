"use strict";

var path = require('path');

var LiPS = require('./index.js');

var fileLiPS = LiPS.create({
    implementation: 'file-lips'
});

fileLiPS.on({
    filepath: path.join(__dirname, 'test.txt'),
    fileEncoding: 'utf8',
    readingMethod: 'append'
}, function(err, data) {
    if(!err) console.log('content [', data, ']');
});
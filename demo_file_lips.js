"use strict";

var path = require('path');
var ON_DEATH = require('death');

var LiPS = require('./index.js');

var fileLiPS = LiPS.create({
    implementation: 'file-lips'
});

var listener = fileLiPS.on({
    filepath: path.join(__dirname, 'plop'),
    fileEncoding: 'utf8',
    readingMethod: 'append'
}, function(err, data) {
    if(!err) console.log('content [', data, ']');
});

ON_DEATH(function() {
    console.log('terminating listeners');
    listener();
    setTimeout(function() {
        console.log('exiting process');
        process.exit();
    } ,1e3);
});
"use strict";

var path = require('path');
var ON_DEATH = require('death');

var LiPS = require('./index.js');

var socketIOLips = LiPS.create({
    implementation: 'socket.io-lips'
});

require('./demo_socket.io_lips_server')(4000, 'message');

var listener = socketIOLips.on({
    host: 'ws://localhost',
    port: 4000,
    eventName: 'message'
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
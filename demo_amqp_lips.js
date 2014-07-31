"use strict";

var ON_DEATH = require('death');

var LiPS = require('./index.js');

var amqpLiPS = LiPS.create({
    implementation: 'amqp-lips'
});
console.log(amqpLiPS);
var listener = amqpLiPS.on({
    host: '192.168.33.33',
    port: '5673',
    login: 'lafourchette',
    password: 'lafourchette',
    vhost: '/',
    queueName: 'lips.queue.test',
    autoDelete: false,
    durable: true,
    exclusive: false
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
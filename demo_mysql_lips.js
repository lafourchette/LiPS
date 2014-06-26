"use strict";

var ON_DEATH = require('death');

var LiPS = require('./index.js');

var mysqlLiPS = LiPS.create({
    implementation: 'mysql-lips'
});

var listener = mysqlLiPS.on({
    filepath: '/home/administrateur/tmp/mysql_result',
    config: {
        host: 'localhost',
        user: 'root',
        password: 'bay1203',
        database: 'portal'
    },
    eventName: 'test',
    table: 'restaurant',
    eventType: 'AFTER UPDATE'
}, function (err, data){

});
//
//var listener2 = mysqlLiPS.on({
//    filepath: '/home/administrateur/tmp/mysql_result1',
//    config: {
//        host: 'localhost',
//        user: 'root',
//        password: 'bay1203',
//        database: 'portal'
//    },
//    eventName: 'test',
//    table: 'restaurant',
//    eventType: 'BEFORE UPDATE'
//}, function (err, data){
//
//});

ON_DEATH(function() {
    console.log('terminating listeners');
    listener();
//    listener2();
    setTimeout(function() {
        console.log('exiting process');
        process.exit();
    } ,1e3);
});
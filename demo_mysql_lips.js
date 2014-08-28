"use strict";

var ON_DEATH = require('death');

var LiPS = require('./index.js');

var mysqlLiPS = LiPS.create({
    implementation: 'mysql-lips'
});

var listener = mysqlLiPS.on({
    filepath: '/home/user_directory/tmp/mysql_result',
    config: {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'database'
    },
    eventName: 'test',
    table: 'my_table',
    eventType: 'AFTER UPDATE'
}, function (err, data){

});

ON_DEATH(function() {
    console.log('terminating listeners');
    listener();
    setTimeout(function() {
        console.log('exiting process');
        process.exit();
    } ,1e3);
});
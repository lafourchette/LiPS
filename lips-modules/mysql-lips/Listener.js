"use strict";

var mysql = require('mysql'),
    path  = require('path'),
    fs    = require('fs');

/**
 *
 * @param {object} eventOptions
 * @param {Function} parser
 * @param {Function} callback
 * @constructor
 */
function Listener(eventOptions, parser, callback) {
    this.eventOptions = eventOptions;
    this.parser = parser;
    this.callback = callback;
    this.mysqlConn = null;
    this.eventName = [this.eventOptions.eventName, +new Date(), Listener.uniqueEventId].join('_');
    this.init();
    this.inc = 0;
    Listener.uniqueEventId++;
}

Listener.prototype.outfileEncoding = 'utf8';

Listener.uniqueEventId = 0;

/**
 * Initialise listener
 */
Listener.prototype.init = function(){

};

/**
 * Create connection to database
 */
Listener.prototype.createConnection = function () {
    this.eventOptions.config.multipleStatements = true;
    this.mysqlConn = mysql.createConnection(this.eventOptions.config);
};

/**
 *
 */
Listener.prototype.createTrigger = function () {
    var sql = "CREATE TRIGGER "+this.eventName+" "+this.eventOptions.eventType+" ON "+this.eventOptions.table+" FOR EACH ROW \nBEGIN \n    SELECT * FROM restaurant WHERE uid_restaurant = NEW.uid_restaurant INTO OUTFILE ?; \nEND";
    this.execQuery(sql, [this.eventOptions.filepath]);
};

/**
 *
 */
Listener.prototype.dropTrigger = function () {
    var sql = "DROP TRIGGER "+this.eventName;
    this.execQuery(sql);
};

/**
 *
 */
Listener.prototype.remove = function (){
    if(this.watcher) {
        this.watcher.close();
        this.watcher = null;
    }
    this.dropTrigger();
};

Listener.prototype.execQuery = function (sql, values, cb){
    this.createConnection();
    var self = this;
    if (!(values instanceof Array)) {
        values = [];
    }
    this.mysqlConn.connect(function (){
        self.mysqlConn.query(sql, values, function(err, results) {
            if(typeof cb === 'function' ) {
                cb.apply(self, arguments);
            }
            if (err) {
                self.mysqlConn.destroy();
                throw err;
            }
            self.mysqlConn.destroy();
        });
    });
};

Listener.prototype.initWatcher = function() {
    var filepath = this.eventOptions.filepath;
    var dirname = path.dirname(filepath);
    var basename = path.basename(filepath);
    var self = this;

    this.watcher = fs.watch(dirname);
    this.watcher.on('change', function(event, filename){
        if (event == 'change' && filename === basename) {
            var newFilePath = filepath + '_' + self.inc;
            fs.rename(filepath, newFilePath, function(){
                self.processOutfile(newFilePath);
            });
            self.inc++;
        }
    });
};

Listener.prototype.processOutfile = function(renamedFilepath) {
    var self = this;
    fs.stat(renamedFilepath, function(err, stats) {
        console.log('STAT', arguments);
        if(!err && stats.size && Math.abs(stats.atime - new Date()) < 1e3) {
            fs.readFile(renamedFilepath, self.outfileEncoding, function(err, data) {
                console.log('READ', data);
                fs.unlink(renamedFilepath, function(err) {
                    if(!err) {
                        console.log(renamedFilepath + ' deleted successfully');
                    }
                });
            });
        }
    });
};

module.exports = Listener;
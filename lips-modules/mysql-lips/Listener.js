"use strict";

var mysql  = require('mysql'),
    path   = require('path'),
    fs     = require('fs'),
    logger = require('./logger');

/**
 *
 * @param {object} eventOptions
 * @param {string} eventOptions.eventName Name of the trigger
 * @param {object} eventOptions.config Configuration object for mysql connection
 * @param {string} eventOptions.eventType Type of mysql event /(BEFORE|AFTER) (INSERT|UPDATE|DELETE)/
 * @param {string} eventOptions.table Mysql table observed
 * @param {string} eventOptions.field Primary key field of the observed table
 * @param {string} eventOptions.filepath Path to the file used as mysql trigger output (the file path is suffixed so that it's different for each Listener instance)
 * @param {Function} parser
 * @param {Function} callback
 * @alias module:mysql-lips.MysqlLipsListener
 * @constructor
 */
function MysqlLipsListener(eventOptions, parser, callback) {
    this.eventOptions = eventOptions;
    this.parser = parser;
    this.callback = callback;
    this.mysqlConn = null;
    this.eventName = [this.eventOptions.eventName, +new Date(), MysqlLipsListener.uniqueEventId].join('_');
    this.inc = 0;

    if(!this.eventTypeRegexp.test(this.eventOptions.eventType)) {
        throw 'invalid eventType: eventType should match ' + this.eventTypeRegexp.toString();
    }

    MysqlLipsListener.uniqueEventId++;
}

MysqlLipsListener.prototype.eventTypeRegexp = /(BEFORE|AFTER) (INSERT|UPDATE|DELETE)/;

MysqlLipsListener.prototype.outfileEncoding = 'utf8';

MysqlLipsListener.uniqueEventId = 0;

/**
 * Create connection to database
 */
MysqlLipsListener.prototype.createConnection = function () {
    this.eventOptions.config.multipleStatements = true;
    this.mysqlConn = mysql.createConnection(this.eventOptions.config);
};

/**
 * Create mysql trigger for defined options
 */
MysqlLipsListener.prototype.createTrigger = function () {
    var sql = "CREATE TRIGGER "+this.eventName+" "+this.eventOptions.eventType+" ON "+this.eventOptions.table+" FOR EACH ROW \nBEGIN \n    SELECT * FROM "+this.eventOptions.table+" WHERE "+this.eventOptions.field+" = NEW."+this.eventOptions.field+" INTO OUTFILE ?; \nEND";
    this.runQuery(sql, [this.eventOptions.filepath]);
};

/**
 * Remove created mysql trigger
 */
MysqlLipsListener.prototype.dropTrigger = function () {
    var sql = "DROP TRIGGER "+this.eventName;
    this.runQuery(sql);
};

/**
 * Stop watcher and drop mysql trigger
 */
MysqlLipsListener.prototype.remove = function (){
    if(this.watcher) {
        this.watcher.close();
        this.watcher = null;
    }
    this.dropTrigger();
};

/**
 * Connects to mysql database and exec query
 *
 * @param {string} sql Mysql query
 * @param {array} [values] Query parameters
 * @param {function} [cb] Callback function
 */
MysqlLipsListener.prototype.runQuery = function (sql, values, cb){
    this.createConnection();
    var self = this;
    if (!(values instanceof Array)) {
        values = [];
    }
    this.mysqlConn.connect(function (){
        self.execQuery(sql, values, cb);
    });
};

/**
 * Executes query
 *
 * @param {string} sql Mysql query
 * @param {array} values Query parameters
 * @param {function} [cb] Callback function
 */
MysqlLipsListener.prototype.execQuery = function(sql, values, cb) {
    var self = this;
    this.mysqlConn.query(sql, values, function(err, results) {
        if(typeof cb === 'function' ) {
            cb.apply(self, arguments);
        }
        if (err) {
            self.mysqlConn.destroy();
            throw err;
        }
        self.mysqlConn.destroy();
    });
};

/**
 * Initialize the directory watcher and listen to the change event
 */
MysqlLipsListener.prototype.initWatcher = function() {
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

/**
 * Reads the file and call the callback on the read data
 * @param {string} renamedFilepath
 */
MysqlLipsListener.prototype.processOutfile = function(renamedFilepath) {
    var self = this;
    fs.stat(renamedFilepath, function(err, stats) {
        logger.info('STAT', arguments);
        if(!err && stats.size && Math.abs(stats.atime - new Date()) < 1e3) {
            fs.readFile(renamedFilepath, self.outfileEncoding, function(err, data) {
                logger.info('READ', data);
                fs.unlink(renamedFilepath, function(err) {
                    if(!err) {
                        logger.info(renamedFilepath + ' deleted successfully');
                    } else {
                        logger.error('UNLINK ' + renamedFilepath, err);
                    }
                });
                self._readFileCallback(err, data);
            });
        }
    });
};

/**
 * TODO: have a default parser for transforming sql data into json
 * @param {Error} [err]
 * @param {string} [data]
 * @private
 */
MysqlLipsListener.prototype._readFileCallback = function(err, data) {
    if(err) {
        this.callback(err);
    } else {
        var parsedData;
        try {
            parsedData = this.parser(data);
        } catch (parsingError) {
            this.callback(new Error('parsing error'));
            return ;
        }
        this.callback(null, parsedData);
    }
};

module.exports = MysqlLipsListener;
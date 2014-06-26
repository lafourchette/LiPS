var sinon      = require('sinon'),
    Listener = require('../Listener.js'),
    fs = require('fs'),
    mysql = require('mysql');

describe('mysql-lips', function() {

    describe('Listener', function() {

        var eventOptions, parsedData = 'test', callback, instance;

        beforeEach(function(){
            eventOptions = {
                eventName: 'eventName',
                config: {},
                eventType: 'AFTER INSERT',
                table: 'my_table',
                field: 'id',
                filepath: 'tmp/filepath'
            };
            parser = sinon.stub().returns(parsedData);
            callback = sinon.spy();
            instance = new Listener(eventOptions, parser, callback);
        });


        describe('constructor', function() {

            var instanceInError;

            it('should bind attributes', function(done) {
                instance.eventOptions.should.equal(eventOptions);
                instance.parser.should.equal(parser);
                instance.callback.should.equal(callback);
                instance.eventName.should.match(new RegExp('^' + eventOptions.eventName));
                (instance.mysqlConn == null).should.be.ok;
                instance.inc.should.equal(0);
                done();
            });

            it('should throw an error when eventType is invalid', function(done) {
                var previousEventType = eventOptions.eventType;
                eventOptions.eventType = 'invalidEventType';

                (function() {
                    instanceInError = new Listener(eventOptions, parser, callback);
                }).should.throw();

                eventOptions.eventType = previousEventType;
                done();
            });

        });

        describe('prototype', function() {

            describe('createConnection', function() {

                it('should call mysql connection creation with config object and bind it on the instance', function(done) {
                    var mysqlConn = {};
                    sinon.stub(mysql, 'createConnection').returns(mysqlConn);

                    instance.createConnection();

                    instance.mysqlConn.should.equal(mysqlConn);
                    mysql.createConnection.calledWithExactly(eventOptions.config).should.be.ok;

                    mysql.createConnection.restore();
                    done();
                });

            });

            describe('createTrigger', function() {

                it('should call runQuery with the right args', function(done) {
                    sinon.stub(instance, 'runQuery');

                    instance.createTrigger();

                    instance.runQuery.lastCall.args[0].should.match(new RegExp('CREATE TRIGGER eventName_\\d+_\\d+ AFTER INSERT ON my_table FOR EACH ROW \nBEGIN \n    SELECT \\* FROM my_table WHERE id = NEW.id INTO OUTFILE \\?; \nEND'));
                    instance.runQuery.lastCall.args[1].should.containEql(eventOptions.filepath);

                    instance.runQuery.restore();
                    done();
                });

            });

            describe('dropTrigger', function() {

                it('should call runQuery with the right args', function(done) {
                    sinon.stub(instance, 'runQuery');

                    instance.dropTrigger();

                    instance.runQuery.lastCall.args[0].should.match(new RegExp('DROP TRIGGER eventName_\\d+_\\d+'));

                    instance.runQuery.restore();
                    done();
                });

            });

            describe('remove', function() {

                it('should close the watcher and nullify its reference', function(done) {
                    var watcher = instance.watcher = {
                        close: sinon.spy()
                    };
                    instance.remove();

                    watcher.close.calledOnce.should.be.ok;
                    (instance.watcher === null).should.be.ok;

                    done();
                });

                it('should call dropTrigger', function(done) {
                    sinon.stub(instance, 'dropTrigger');

                    instance.remove();

                    instance.dropTrigger.calledOnce.should.be.ok;

                    instance.dropTrigger.restore();

                    done();
                });

            });

            describe('runQuery', function() {

                var callback;

                beforeEach(function() {

                    sinon.stub(instance, 'createConnection');
                    sinon.stub(instance, 'execQuery');
                    instance.mysqlConn = {
                        connect: sinon.stub().callsArg(0)
                    };
                    callback = sinon.spy();

                });

                it('should call createConnection', function(done) {
                    instance.runQuery();

                    instance.createConnection.calledOnce.should.be.ok;

                    done();
                });

                it('should call execQuery without values', function(done) {
                    instance.runQuery('query', null, callback);

                    var lastCall = instance.execQuery.lastCall;
                    lastCall.args[0].should.equal('query');
                    lastCall.args[1].should.be.an.instanceof(Array);
                    lastCall.args[1].length.should.equal(0);
                    lastCall.args[2].should.equal(callback);

                    done();
                });

                it('should call execQuery with values', function(done) {
                    instance.runQuery('query', [0, 1, 2], callback);

                    var lastCall = instance.execQuery.lastCall;
                    lastCall.args[0].should.equal('query');
                    lastCall.args[1].should.be.an.instanceof(Array);
                    lastCall.args[1].length.should.equal(3);
                    lastCall.args[2].should.equal(callback);

                    done();
                });

                afterEach(function() {

                    instance.createConnection.restore();
                    instance.execQuery.restore();

                });

            });

            describe('execQuery', function() {

                var callback, results = 'results', destroySpy;

                beforeEach(function() {

                    destroySpy = sinon.spy();
                    callback = sinon.spy();

                });

                it('should call the callback if provided', function(done) {
                    instance.mysqlConn = {
                        query: sinon.stub().callsArgWith(2, null, results),
                        destroy: destroySpy
                    };

                    instance.execQuery('query', [], callback);

                    callback.calledWithExactly(null, results).should.be.ok;

                    done();
                });

                it('should throw the query error', function(done) {
                    instance.mysqlConn = {
                        query: sinon.stub().callsArgWith(2, new Error(), null),
                        destroy: destroySpy
                    };

                    (function() {
                        instance.execQuery('query', [], callback);
                    }).should.throw();

                    done();
                });

                it('should destroy the connection', function(done) {
                    instance.mysqlConn = {
                        query: sinon.stub().callsArgWith(2, null, results),
                        destroy: destroySpy
                    };
                    instance.execQuery('query', [], callback);

                    instance.mysqlConn.destroy.calledOnce.should.be.ok;
                    done();
                });

            });

            describe('initWatcher', function() {

                var watcher;

                beforeEach(function() {

                    watcher = {
                        on: sinon.stub().callsArgWith(1, 'change', 'filepath')
                    };
                    sinon.stub(fs, 'watch').returns(watcher);
                    sinon.stub(fs, 'rename').callsArgWith(2);
                    sinon.stub(instance, 'processOutfile');

                    instance.initWatcher();

                });

                it('should create the watcher and bind it to the instance', function(done) {

                    instance.watcher.should.equal(watcher);

                    done();
                });

                it('should register a callback on watcher change event which renames the file then calls processOutfile on the instance', function(done) {

                    fs.rename.calledOnce.should.be.ok;
                    instance.processOutfile.calledOnce.should.be.ok;

                    done();
                });

                it('should increment', function(done) {

                    instance.inc.should.equal(1);

                    done();
                });

                afterEach(function() {

                    fs.watch.restore();
                    fs.rename.restore();

                    instance.processOutfile.restore();

                });

            });

            describe('processOutfile', function() {

                beforeEach(function() {

                    sinon.stub(fs, 'stat').callsArgWith(1, null, { size: 5, atime: new Date() });
                    sinon.stub(fs, 'readFile').callsArgWith(2, null, 'data');
                    sinon.stub(fs, 'unlink').callsArgWith(1, null);

                    sinon.stub(instance, '_readFileCallback');

                    instance.processOutfile('filepath');

                });
                
                it('should call fs.stat on the given filepath', function(done) {

                    fs.stat.calledOnce.should.be.ok;
                    fs.stat.lastCall.args[0].should.equal('filepath');

                    done();
                });

                it('should call fs.readFile on the given filepath and the outfile encoding', function(done) {

                    fs.readFile.calledOnce.should.be.ok;
                    fs.readFile.lastCall.args[0].should.equal('filepath');
                    fs.readFile.lastCall.args[1].should.equal(instance.outfileEncoding);

                    done();
                });

                it('should call fs.unlink on the given filepath', function(done) {

                    fs.stat.calledOnce.should.be.ok;
                    fs.stat.lastCall.args[0].should.equal('filepath');

                    done();
                });

                afterEach(function() {

                    fs.stat.restore();
                    fs.readFile.restore();
                    fs.unlink.restore();

                    instance._readFileCallback.restore();

                });

            });

            describe('_readFileCallback', function() {

                it('should call the callback with the error if it exists', function(done) {
                    var err = new Error();
                    instance._readFileCallback(err, null);
                    callback.calledWithExactly(err).should.be.ok;
                    done();
                });

            });



            describe('_readFileCallback', function(){
                
                describe('with error', function(){
                    var err = {};
                    beforeEach(function(){
                        instance = new Listener(eventOptions, parser, callback);
                        instance._readFileCallback(err, '');
                    });
                    it('should call callback with error', function(done){

                        instance.callback.calledOnce.should.be.ok;
                        instance.callback.lastCall.args[0].should.equal(err);
                        instance.callback.lastCall.args.length.should.equal(1);
                        done();
                    });

                });
                describe('with exception on parser', function(){
                    var data = 'test';
                    beforeEach(function(){
                        parser = sinon.stub().throws();
                        instance = new Listener(eventOptions, parser, callback);
                        instance._readFileCallback(null, data);
                    });
                    it('should call callback with exception', function(done){
                        instance.callback.calledOnce.should.be.ok;
                        instance.callback.lastCall.args[0].should.be.instanceOf(Error);
                        instance.callback.lastCall.args.length.should.equal(1);
                        instance.parser.calledOnce.should.be.ok;
                        instance.parser.lastCall.args[0].should.equal(data);
                        instance.parser.lastCall.args.length.should.equal(1);
                        done();
                    });

                });

                describe('with no exception and no error', function(){
                    var data = 'test';
                    beforeEach(function(){
                        parser = sinon.stub().returns(parsedData);
                        instance = new Listener(eventOptions, parser, callback);
                        instance._readFileCallback(null, data);
                    });
                    it('should parse data and call the callback function with parsedData', function(done){
                        instance.parser.calledOnce.should.be.ok;
                        instance.parser.lastCall.args[0].should.equal(data);
                        instance.parser.lastCall.args.length.should.equal(1);

                        instance.callback.calledOnce.should.be.ok;
                        instance.callback.calledWithExactly(null, parsedData).should.be.ok;
                        done();
                    });
                });

            });

        });

    });

});
var sinon      = require('sinon'),
    Listener = require('../Listener.js'),
    fs = require('fs');

describe('file-lips', function() {

    describe('Listener', function() {
        var parser, callback, appendInstance, appendedEventOptions, newInstance, newEventOptions;

        beforeEach(function(){
            appendedEventOptions = {
                fileEncoding: 'iso666',
                readingMethod: 'append',
                filepath: 'filepath'
            };
            newEventOptions = {
                fileEncoding: 'iso666',
                readingMethod: 'new',
                filepath: 'filepath'
            };
            parser = sinon.stub().returns('test');
            callback = sinon.spy();
        });


        describe('constructor', function() {

            beforeEach(function() {
                sinon.stub(Listener.prototype, 'init').returns();
                appendInstance = new Listener(appendedEventOptions, parser, callback);
            });

            it('should bind attributes', function(done) {
                appendInstance.eventOptions.should.equal(appendedEventOptions);
                appendInstance.parser.should.equal(parser);
                appendInstance.callback.should.equal(callback);
                (appendInstance.watcher == null).should.be.ok;
                appendInstance.inc.should.equal(0);
                done();
            });

            it('should initialize', function(done) {
                appendInstance.init.calledOnce.should.be.ok;
                done();
            });

            afterEach(function() {
                Listener.prototype.init.restore();
            });

        });

        describe('prototype', function() {

            describe('init', function() {

                describe('main branch', function() {

                    beforeEach(function() {
                        // contructor calls init, previously tested
                        sinon.stub(Listener.prototype, 'appendListener').returns();
                        appendInstance = new Listener(appendedEventOptions, parser, callback);
                    });

                    it('should bind fileEncoding', function(done) {
                        appendInstance.fileEncoding.should.equal(appendedEventOptions.fileEncoding);
                        done();
                    });

                    afterEach(function() {
                        Listener.prototype.appendListener.restore();
                    });

                });

                describe('called listener', function() {

                    describe('case readingMethod == "append"', function() {

                        beforeEach(function() {

                            sinon.stub(Listener.prototype, 'appendListener').returns();
                            appendInstance = new Listener(appendedEventOptions, parser, callback);

                        });

                        it('should call the appendListener', function(done) {
                            appendInstance.appendListener.calledOnce.should.be.ok;
                            done();
                        });

                        afterEach(function() {

                            Listener.prototype.appendListener.restore();

                        });

                    });

                    describe('case readingMethod == "new"', function() {

                        beforeEach(function() {

                            sinon.stub(Listener.prototype, 'newListener').returns();
                            newInstance = new Listener(newEventOptions, parser, callback);

                        });

                        it('should call the appendListener', function(done) {
                            newInstance.newListener.calledOnce.should.be.ok;
                            done();
                        });

                        afterEach(function() {

                            Listener.prototype.newListener.restore();

                        });

                    });

                });

            });

            describe('remove', function() {

                beforeEach(function() {

                    sinon.stub(Listener.prototype, 'appendListener').returns();
                    appendInstance = new Listener(appendedEventOptions, parser, callback);
                    
                });
                
                it('should close the watcher if exists, clear its reference and return true', function(done) {
                    var watcher = appendInstance.watcher = {
                        close: sinon.spy()
                    };
                    var returnValue = appendInstance.remove();
                    watcher.close.calledOnce.should.be.ok;
                    (appendInstance.watcher == null).should.be.ok;
                    returnValue.should.be.true;
                    done();
                });

                it('should return false if no watcher attached', function(done) {
                    appendInstance.watcher = null;
                    var returnValue = appendInstance.remove();
                    returnValue.should.be.false;
                    done();
                });
                
                afterEach(function() {
                    
                    Listener.prototype.appendListener.restore();
                    
                });

            });
            
            describe('appendListener', function() {

                var watcher;
                
                beforeEach(function() {
                    
                    sinon.stub(fs, 'stat').callsArgWith(1, null, {size: 5});
                    sinon.spy(Listener.prototype, '_appendedFileWatcher');
                    watcher = { on: sinon.stub().callsArg(1) };
                    sinon.stub(fs, 'watch').returns(watcher);
                    appendInstance = new Listener(appendedEventOptions, parser, callback);

                });

                it('should call fs.stat and set inc with data size', function(done) {
                    appendInstance.inc.should.equal(4);
                    done();
                });

                it('should call attach the watcher created with fs.watch', function(done) {
                    appendInstance.watcher.should.equal(watcher);
                    done();
                });

                it('should call "on" on the created watcher with a _appendedFileWatcher as a callback', function(done) {
                    watcher.on.withArgs('change').calledOnce.should.be.ok;
                    appendInstance._appendedFileWatcher.calledOnce.should.be.ok;
                    done();
                });

                afterEach(function() {

                    Listener.prototype._appendedFileWatcher.restore();
                    fs.stat.restore();
                    fs.watch.restore();

                });
                
            });

            describe('_appendFileWatcher', function() {

                //TODO: stub fs.createReadStream

            });

        });

    });

});
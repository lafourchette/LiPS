var sinon      = require('sinon'),
    Listener = require('../Listener.js'),
    fs = require('fs');

describe('file-lips', function() {

    describe('Listener', function() {
        var parser, callback, appendInstance, appendedEventOptions, newInstance, newEventOptions,
            parsedData = 'test';

        beforeEach(function(){
            appendedEventOptions = {
                fileEncoding: 'iso666',
                readingMethod: 'append',
                filepath: 'tmp/filepath'
            };
            newEventOptions = {
                fileEncoding: 'iso666',
                readingMethod: 'new',
                filepath: 'tmp/filepath'
            };
            parser = sinon.stub().returns(parsedData);
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

                it('should call watch with the right dirname', function(done){
                    fs.watch.calledWithExactly('tmp').should.be.ok;
                    done();
                });

                it('should call fs.stat with the basepath given in the eventOptions', function(done){
                    fs.stat.calledWith(appendedEventOptions.filepath).should.be.ok;
                    done();
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
                var stream,
                    data = '';
                beforeEach(function(){
                    stream = {
                        'on' : sinon.stub().callsArgWith(1, data)
                    };
                    sinon.stub(fs, 'createReadStream').returns(stream);
                    sinon.spy(Listener.prototype, '_appendFileReadStreamOnData');
                    appendInstance.inc = 42;
                });
                describe('with the right filepath', function () {
                    beforeEach(function(){
                        appendInstance._appendedFileWatcher({}, 'filepath');
                    });

                    it('should call createReadStream', function(done){
                        fs.createReadStream.calledWithExactly(appendedEventOptions.filepath, {encoding: appendedEventOptions.fileEncoding, autoClose:false, start: 42}).should.be.ok;
                        done();
                    })

                    it('should bind on on data', function(done){
                        appendInstance._appendFileReadStreamOnData.calledWithExactly(data).should.be.ok;
                        done();
                    });

                });

                describe('with the wrong filepath', function () {
                    beforeEach(function(){
                        appendInstance._appendedFileWatcher({}, 'wrong');
                    });

                    it('should not call createReadStream', function(done){
                        fs.createReadStream.called.should.be.not.ok;
                        done();
                    })

                })
                afterEach(function(){
                    Listener.prototype._appendFileReadStreamOnData.restore();
                    fs.createReadStream.restore();
                });

            });

            describe('_appendFileReadStreamOnData', function(){
                var data = "data";
                describe('in all cases', function(){
                    beforeEach(function(){
                        appendInstance._appendFileReadStreamOnData(data);
                    });
                    it('should call parser with data', function(done){
                        appendInstance.parser.calledWithExactly(data.slice(0,-1)).should.be.ok;
                        done();
                    });
                });
                describe('with no exception', function(){
                    beforeEach(function(){
                        appendInstance.inc = 42;
                        appendInstance._appendFileReadStreamOnData(data);
                    })
                    it('should call callback with no error', function(done){
                        appendInstance.callback.calledWithExactly(null, parsedData).should.be.ok;
                        done();
                    });
                    it('should increase inc', function(done){
                        appendInstance.inc.should.equal(45);
                        done();
                    });
                });

                describe('with exception', function(){
                    beforeEach(function(){
                        parser = sinon.stub().throws();
                        sinon.stub(Listener.prototype, 'init');
                        appendInstance = new Listener(appendedEventOptions, parser, callback);
                        appendInstance.inc = 42;
                        appendInstance._appendFileReadStreamOnData(data);
                    });
                    it('should call callback with error', function(done){
                        appendInstance.callback.lastCall.args[0].should.be.instanceOf(Error);
                        done();
                    });
                    it('should not increment inc', function(done){
                        appendInstance.inc.should.equal(42);
                        done();
                    });
                    afterEach(function(){
                        Listener.prototype.init.restore();
                    });
                });

            });

            describe('newListener', function(){
                var watcher;

                beforeEach(function() {

                    sinon.spy(Listener.prototype, '_newFileWatcher');
                    watcher = { on: sinon.stub().callsArg(1) };
                    sinon.stub(fs, 'watch').returns(watcher);
                    newInstance = new Listener(newEventOptions, parser, callback);

                });

                it('should call watch with the right dirname', function(done){
                    fs.watch.calledWithExactly('tmp').should.be.ok;
                    done();
                });


                it('should call attach the watcher created with fs.watch', function(done) {
                    newInstance.watcher.should.equal(watcher);
                    done();
                });

                it('should call "on" on the created watcher with a _newFileWatcher as a callback', function(done) {
                    watcher.on.withArgs('change').calledOnce.should.be.ok;
                    newInstance._newFileWatcher.calledOnce.should.be.ok;
                    done();
                });

                afterEach(function() {
                    Listener.prototype._newFileWatcher.restore();
                    fs.watch.restore();
                });
            });

            describe('_newFileWatcher', function(){
                beforeEach(function(){
                    sinon.stub(fs, 'readFile').callsArgWith(2, {}, 'test');
                    sinon.spy(Listener.prototype, '_newFileReadFileCallback');
                    sinon.stub(fs, 'stat').callsArgWith(1, null, {size: 5, atime: new Date()});
                });
                describe('with the right filepath', function () {
                    beforeEach(function(){
                        newInstance._newFileWatcher({}, 'filepath');
                    });

                    it('should call readFile', function(done){
                        fs.readFile.calledWith(newEventOptions.filepath, newEventOptions.fileEncoding).should.be.ok;
                        done();
                    })

                    it('should call _newFileReadFileCallback with the rigth args', function(done){
                        newInstance._newFileReadFileCallback.lastCall.args.should.containDeep([{}, 'test']);
                        done();
                    });

                });

                describe('with the wrong filepath', function () {
                    beforeEach(function(){
                        newInstance._newFileWatcher({}, 'wrong');
                    });

                    it('should not call readFile', function(done){
                        fs.readFile.called.should.be.not.ok;
                        done();
                    })

                });
                afterEach(function(){
                    Listener.prototype._newFileReadFileCallback.restore();
                    fs.readFile.restore();
                    fs.stat.restore();
                });
            });

            describe('_newFileReadFileCallback', function(){
                beforeEach(function(){
                    sinon.stub(Listener.prototype, 'init');
                });
                describe('with error', function(){
                    var err = {};
                    beforeEach(function(){
                        newInstance = new Listener(newEventOptions, parser, callback);
                        newInstance._newFileReadFileCallback(err, '');
                    });
                    it('should call callback with error', function(done){

                        newInstance.callback.calledOnce.should.be.ok;
                        newInstance.callback.lastCall.args[0].should.equal(err);
                        newInstance.callback.lastCall.args.length.should.equal(1);
                        done();
                    });

                });
                describe('with exception on parser', function(){
                    var data = 'test';
                    beforeEach(function(){
                        parser = sinon.stub().throws();
                        newInstance = new Listener(newEventOptions, parser, callback);
                        newInstance._newFileReadFileCallback(null, data);
                    });
                    it('should call callback with exception', function(done){
                        newInstance.callback.calledOnce.should.be.ok;
                        newInstance.callback.lastCall.args[0].should.be.instanceOf(Error);
                        newInstance.callback.lastCall.args.length.should.equal(1);
                        newInstance.parser.calledOnce.should.be.ok;
                        newInstance.parser.lastCall.args[0].should.equal(data);
                        newInstance.parser.lastCall.args.length.should.equal(1);
                        done();
                    });

                });

                describe('with no exception and no error', function(){
                    var data = 'test';
                    beforeEach(function(){
                        parser = sinon.stub().returns(parsedData);
                        newInstance = new Listener(newEventOptions, parser, callback);
                        newInstance._newFileReadFileCallback(null, data);
                    });
                    it('should parse data and call the callback function with parsedData', function(done){
                        newInstance.parser.calledOnce.should.be.ok;
                        newInstance.parser.lastCall.args[0].should.equal(data);
                        newInstance.parser.lastCall.args.length.should.equal(1);

                        newInstance.callback.calledOnce.should.be.ok;
                        newInstance.callback.calledWithExactly(null, parsedData).should.be.ok;
                        done();
                    });
                });
                afterEach(function(){
                    Listener.prototype.init.restore();
                })

            });

        });

    });

});
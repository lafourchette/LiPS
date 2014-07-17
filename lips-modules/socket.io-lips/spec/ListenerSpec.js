"use strict";

var rewire = require('rewire');

var Listener = rewire('../Listener.js');

describe('socket.io-lips', function() {

    describe('Listener', function() {

        var eventOptions, parser, callback, parsedData = 'test', instance;

        beforeEach(function() {
            eventOptions = {
                host: 'localhost',
                port: 80,
                eventName: 'message'
            };
            parser = sinon.stub().returns(parsedData);
            callback = sinon.spy();
        });

        describe('constructor', function() {

            beforeEach(function() {
                sinon.stub(Listener.prototype, 'init').returns();
                instance = new Listener(eventOptions, parser, callback);
            });

            it('should bind attributes', function(done) {
                instance.eventOptions.should.equal(eventOptions);
                instance.parser.should.equal(parser);
                instance.callback.should.equal(callback);
                (instance.io == null).should.be.ok;
                done();
            });

            afterEach(function() {
                Listener.prototype.init.restore();
            });

        });

        describe('prototype', function() {

            describe('init', function() {
                var revert, ioClientInstance;


                beforeEach(function() {
                    ioClientInstance = {
                        on: sinon.stub().callsArgWith(1)
                    };
                    revert = Listener.__set__('ioClient', function() {
                        return ioClientInstance;
                    });


                    sinon.stub(Listener.prototype, '_parseData');
                    instance = new Listener(eventOptions, parser, callback);
                });

                it('should bind the io client instance', function(done) {
                    instance.io.should.equal(ioClientInstance);
                    done();
                });

                it('should call _parseData when event "eventName" is triggered', function(done){
                    instance._parseData.should.have.been.called;
                    done();
                });

                afterEach(function() {
                    revert();
                    Listener.prototype._parseData.restore();
                });

            });

            describe('_parseData', function(){
                beforeEach(function(){
                    sinon.stub(Listener.prototype, 'init');
                });

                describe('with exception on parser', function(){
                    var data = 'test';
                    beforeEach(function(){
                        parser = sinon.stub().throws();
                        instance = new Listener(eventOptions, parser, callback);
                        instance._parseData(data);
                    });
                    it('should call callback with exception', function(done){
                        instance.callback.should.have.been.calledWithExactly(new Error());
                        instance.parser.should.have.been.calledWithExactly(data);
                        done();
                    });

                });

                describe('with no exception and no error', function(){
                    var data = 'test';
                    beforeEach(function(){
                        parser = sinon.stub().returns(parsedData);
                        instance = new Listener(eventOptions, parser, callback);
                        instance._parseData(data);
                    });
                    it('should parse data and call the callback function with parsedData', function(done){
                        instance.callback.should.have.been.calledWithExactly(null, data);
                        instance.parser.should.have.been.calledWithExactly(data);
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

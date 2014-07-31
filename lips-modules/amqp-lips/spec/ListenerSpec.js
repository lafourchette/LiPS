"use strict";

var Listener = require('../Listener.js');
var amqp = require('amqp');

describe('amqp-lips', function() {

    describe('Listener', function() {

        var eventOptions, parser, callback, parsedData = 'test', instance;

        beforeEach(function() {
            eventOptions = {
                host: 'localhost',
                port: 80,
                login: 'test',
                password: 'test',
                vhost: '/',
                queueName: 'queue.test',
                autoDelete: false,
                durable: false,
                exclusive: false
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
                (instance.connection == null).should.be.ok;
                done();
            });

            afterEach(function() {
                Listener.prototype.init.restore();
            });

        });

        describe('prototype', function() {

            describe('init', function() {

                var queue = {}, connection;

                beforeEach(function() {
                    connection = {
                        on: sinon.stub().callsArgWith(1, queue)
                    };
                    sinon.stub(amqp, 'createConnection').returns(connection);
                    sinon.stub(Listener.prototype, '_createQueue');
                    instance = new Listener(eventOptions, parser, callback);
                });

                it('should bind the amqp connection', function(done) {
                    instance.connection.should.equal(connection);
                    done();
                });

                it('should call _createQueue when connection is ready', function(done){
                    instance._createQueue.should.have.been.called;
                    done();
                });

                afterEach(function() {
                    amqp.createConnection.restore();
                    Listener.prototype._createQueue.restore();
                });

            });

            describe('_createQueue', function() {

                var queue = {};

                beforeEach(function() {
                    sinon.stub(Listener.prototype, 'init');
                    sinon.stub(Listener.prototype, '_bindQueue');
                    instance = new Listener(eventOptions, parser, callback);
                    instance.connection = {
                        queue: sinon.stub().callsArgWith(2, queue)
                    };
                    instance._createQueue();
                });

                it('should call connection queue method', function() {

                    instance.connection.queue.should.have.been.calledWith(eventOptions.queueName, {
                        autoDelete: eventOptions.autoDelete,
                        durable: eventOptions.durable,
                        exclusive: eventOptions.exclusive
                    });

                });

                it('should call instance _bindQueue with provided queue', function() {

                    instance._bindQueue.should.have.been.calledWithExactly(queue);

                });

                afterEach(function() {
                    Listener.prototype.init.restore();
                    Listener.prototype._bindQueue.restore();
                });

            });

            describe('_bindQueue', function() {

                var queue, message = 'message';

                beforeEach(function() {
                    queue = {
                        bind: sinon.spy(),
                        subscribe: sinon.stub().callsArgWith(0, message)
                    };
                    sinon.stub(Listener.prototype, '_parseData');
                    instance = new Listener(eventOptions, parser, callback);
                    instance._bindQueue(queue);
                });

                it('should bind the queue', function() {
                    instance.queue.should.equal(queue);
                });

                it('should call queue binding', function() {
                    queue.bind.should.have.been.calledOnce;
                });

                it('should call queue subscribe', function() {
                    queue.subscribe.should.have.been.calledOnce;
                    instance._parseData.should.have.been.calledWithExactly(message);
                });

                afterEach(function() {
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

            describe('remove', function() {

                var queue;

                beforeEach(function() {
                    queue = {
                        unbind: sinon.spy()
                    };
                    instance = new Listener(eventOptions, parser, callback);
                    instance.queue = queue;
                    instance.remove();
                });

                it('should call queue unbind', function() {
                    instance.queue.unbind.should.have.been.calledOnce;
                });

            });

        });

    });

});

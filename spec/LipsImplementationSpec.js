var LipsImplementation = require('../LipsImplementation.js');

describe('LipsImplementation', function() {

    var LipsImplementation = require('../LipsImplementation.js'),
        instanceWithParser,
        instanceWithoutParser,
        instanceOptions = {
            parser: sinon.spy()
        };

    beforeEach(function() {
        instanceWithParser = new LipsImplementation(instanceOptions);
        instanceWithoutParser = new LipsImplementation();
    });

    it('should attach the given parser to the instance', function(done) {
        instanceWithParser.parser.should.equal(instanceOptions.parser);
        instanceWithoutParser.parser.should.equal(LipsImplementation.prototype.parser);
        done();
    });

    it('should initialize the internal events object ', function(done) {
        instanceWithParser._events.should.be.a('object');
        done();
    });

    describe('prototype parser', function() {

        it('should be the identity function', function(done) {
            instanceWithoutParser.parser('toto').should.equal('toto');
            done();
        });

    });

    describe('prototype on', function() {

        var eventOptions = {},
            callback = function() {};

        beforeEach(function(done) {
            instanceWithParser.addListener = sinon.spy();
            instanceWithParser.removeListener = sinon.spy();
            sinon.spy(instanceWithParser, 'on');
            instanceWithParser.on(eventOptions, callback);
            done();
        });

        it('should call listen with args ( eventOptions, instance parser, callback)', function(done) {
            instanceWithParser.addListener.withArgs(eventOptions, instanceWithParser.parser, callback).calledOnce.should.be.ok;
            done();
        });

        describe('returnValue', function() {

            it('should be a function', function(done) {
                instanceWithParser.on.returnValues[0].should.be.a('function');
                done();
            });

            it('should call provided removeListener with the right args', function(done) {
                var listener = instanceWithParser.on.returnValues[0]();
                instanceWithParser.removeListener.withArgs(listener, eventOptions, instanceWithParser.parser, callback).calledOnce.should.be.ok;
                done();
            });

        });

    });

});
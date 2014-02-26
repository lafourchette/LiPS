var sinon      = require('sinon');
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

    it('should initialize the internal events object and increment', function(done) {
        instanceWithParser._events.should.be.type('object');
        instanceWithParser._increment.should.equal(0);
        done();
    });

    it('should have _increment equal 0', function(done) {
        instanceWithParser._increment.should.equal(0);
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
            instanceWithParser.listen = sinon.spy();
            instanceWithParser.on(eventOptions, callback);
            done();
        });

        it('should call listen with args ( eventOptions, instance parser, callback)', function(done) {
            instanceWithParser.listen.withArgs(eventOptions, instanceWithParser.parser, callback).calledOnce.should.be.ok;
            done();
        });

        it('should have incremented constructor _increment property', function(done) {
            instanceWithParser._increment.should.equal(1);
            done();
        });

        it('should attach the eventOptions and callback as an object')

    });

});
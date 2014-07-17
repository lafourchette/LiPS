var sinon = require('sinon');
var implementor = require('../implementor.js');
var LipsImplementation = require('../LipsImplementation.js');


describe('implementor', function() {

//    beforeEach(function() {
//        sinon.spy(implementor, 'createImplementation');
//    });

    describe('createImplementation', function() {

        describe('assertions', function() {

            it('should throw an exception if addListener arg is not a function', function(done) {

                (function(){
                    implementor.createImplementation(null, function() {});
                }).should.throw();

                done();
            });

            it('should throw an exception if removeListener arg is not a function', function(done) {

                (function(){
                    implementor.createImplementation(function() {}, null);
                }).should.throw();

                done();
            });

        });

        describe('returnValue', function() {

            function addListener() {}
            function removeListener() {}
            function implementationParser() {}

            var SpecificLipsImplementation;

            beforeEach(function(done) {
                sinon.spy(implementor, 'createImplementation');
                implementor.createImplementation(addListener, removeListener, implementationParser);
                SpecificLipsImplementation = implementor.createImplementation.returnValues[0];
                done();
            });

            it('should be a function', function(done) {
                SpecificLipsImplementation.should.be.a('function');
                done();
            });

            it('should inherit from LipsImplementation', function(done) {
                SpecificLipsImplementation.should.not.equal(LipsImplementation);
                var specificLipsImplementation = new SpecificLipsImplementation;
                specificLipsImplementation.should.be.instanceof(LipsImplementation);
                done();
            });

            describe('SpecificLipsImplementation', function() {

                describe('prototype', function() {

                    it('should hold addListener, removeListener and implementationParser arguments as prototype methods', function(done) {
                        SpecificLipsImplementation.prototype.addListener.should.equal(addListener);
                        SpecificLipsImplementation.prototype.removeListener.should.equal(removeListener);
                        SpecificLipsImplementation.prototype.parser.should.equal(implementationParser);
                        done();
                    });

                });

                describe('constructor', function() {

                    beforeEach(function(done) {
                        sinon.spy(LipsImplementation, 'apply');
                        done();
                    });

                    it('should apply LipsImplementation constructor', function(done) {
                        new SpecificLipsImplementation();
                        LipsImplementation.apply.calledOnce.should.be.ok;
                        done();
                    });

                });

            });

            afterEach(function() {
                implementor.createImplementation.restore();
            });

        });

    });

});
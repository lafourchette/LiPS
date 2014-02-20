describe('LipsImplementation', function() {

    var LipsImplementation = require('../LipsImplementation.js'),
        instance,
        instanceOptions = {
            parser: Jasmine.spy()
        };


    beforeEach(function() {
        instance = new LipsImplementation();
    });

    it('should work', function() {
        expect(true).toEqual(true);
    });
});

var io = require('socket.io');

module.exports = function(port, eventName) {

    var server = io(port);

    server.on('connection', function(socket) {

        console.log('SERVER', 'connection');

        setInterval(function() {

            console.log('SERVER', 'emit');

            socket.emit(eventName, {
                value: Math.random()
            });

        }, 3000);

    });
}
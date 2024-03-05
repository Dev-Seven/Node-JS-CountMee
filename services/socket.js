let socketIO;

exports.openIO = function (io) {
    socketIO = io;
    io.on('connection', function (socket) {
        console.log(`Socket Connection successful ${socket.id}`);
        socket.on('typing', data => {
            socket.broadcast.emit('typing', data); // return data
          });
    })
}

exports.emit = function (topic, message, to = null) {
    if (to) {
        console.log("Socket: ", to);
        socketIO.to(to).emit(topic, message);
    } else {
        socketIO.emit(topic, message);
        console.log('Socket Emmited : ', topic, message);
    }
}

exports.getIO = function () {
    return socketIO;
}
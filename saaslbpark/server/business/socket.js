var socket = require('socket.io');

module.exports.socketSend = (function(io, message){
    io.on('connection',function(socket){
        console.log('入场推送' + message);
        socket.emit('users',{number:message});
      });
})
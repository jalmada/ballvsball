var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
      io.emit('chat message', msg);
  });

  socket.on('mousemove', function(msg){
    socket.broadcast.emit('mousemove', msg);
  });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});
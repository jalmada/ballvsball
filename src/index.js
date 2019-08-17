import * as io from 'socket.io-client';
import $ from 'jquery';

$(function () {
    var socket = io('http://localhost:3000');
    $('form').submit(function(e){
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('chat message', function(msg){
        $('#messages').append($('<li>').text(msg));
    });

    socket.on('mousemove', function(msg){
        let mousepos = JSON.parse(msg);
        $('#x').val(mousepos.x);
        $('#y').val(mousepos.y);
    });

    var myListener = function (e) {
      socket.emit('mousemove', JSON.stringify({x: e.clientX, y:  e.clientY}));
    };

    document.addEventListener('mousemove', myListener, false);
});
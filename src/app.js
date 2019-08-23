import React, { useState, useEffect, useRef} from 'react';
import * as io from 'socket.io-client';
import serverConfig from './config/server';
import Circle from './models/circle';

const socket = io(serverConfig.url);

function App(){

    const [message, setMessage] = useState('');
    const [messengerState, setMessengerState] = useState([]);
    const [canvasState, setCanvasState] = useState({x:0, y:0});
    const canvasRef = useRef(null);

    const onSubmitMsg = e => {
        e.preventDefault();
        if (!message) return;
        socket.emit(serverConfig.sockets.chat, message);
        setMessage('');
        return false;
    }

    const addMessage = (msg) => {
        setMessengerState(prevstate => [...prevstate, msg]);
    }

    const setCoordinates = (msg) => {
        let mousepos = JSON.parse(msg);
        setCanvasState({ x: mousepos.x, y:mousepos.y});
    }

    const paintRemoteCircle = (msg) => {
        let circlepos = JSON.parse(msg);
        let circle = new Circle(circlepos.x, circlepos.y, 10, 10, 2);
        let canvas = canvasRef.current;
        let ctx = canvas.getContext("2d");

        circle.paint(ctx, 'rgb(10,125,10)', 'rgb(255,255,100)');
    }

    const mouseMoveListener = (e) =>  {
        socket.emit(serverConfig.sockets.ballmove, JSON.stringify({x: e.clientX, y:  e.clientY}));
    };


    const addCircle = (e) => {
        e.preventDefault();
        let circle = new Circle(0, 0, 10, 10, 2);
        let canvas = canvasRef.current;
        let ctx = canvas.getContext("2d");

        circle.paint(ctx, 'rgb(255,125,10)', 'rgb(0,255,100)');
        socket.emit(serverConfig.sockets.paintcircle, JSON.stringify({x: 30, y:  30}));
    }
 
    useEffect(() => {
        document.addEventListener(serverConfig.sockets.ballmove, mouseMoveListener, false);
        socket.on(serverConfig.sockets.chat, addMessage);
        socket.on(serverConfig.sockets.ballmove, setCoordinates);
        socket.on(serverConfig.sockets.paintcircle, paintRemoteCircle);
    },[]);

    return (
        <div>
            <img src="gengar.jpg" alt="" />
            <canvas id="stage" ref={canvasRef} width="200" height="200"/>
            <ul id="messages">{messengerState.map((m,i) => (<li key ={i}>{m}</li>))}</ul>
            <form action="" onSubmit={onSubmitMsg}>
                <label htmlFor="x">X:</label><input id="x" type="text" value={canvasState.x} onChange={e => setCanvasState({...canvasState, x: e.target.value})}/>
                <label htmlFor="y">Y:</label><input id="y" type="text" value={canvasState.y} onChange={e => setCanvasState({...canvasState, y: e.target.value})}/>
                <input type="text" id="m" value={message} onChange={e => setMessage(e.target.value)} autoComplete="off" /><button>Send</button>
                <button id="btnAddCircle" onClick={addCircle}>Add Circle</button>
            </form>
        </div>
    )
}

export default App;
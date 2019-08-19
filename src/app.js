import React, { useState, useEffect} from 'react';
import * as io from 'socket.io-client';
import serverConfig from './config/server';

const socket = io(serverConfig.url);

function App(){

    const [message, setMessage] = useState('');
    const [messengerState, setMessengerState] = useState([]);
    const [canvasState, setCanvasState] = useState({x:0, y:0});

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

    // const setCoordinates = (msg) => {
    //     let mousepos = JSON.parse(msg);
    //     setCanvasState({ x: mousepos.x, y:mousepos.y});
    // }

    // const mouseMoveListener = (e) =>  {
    //     socket.emit(serverConfig.sockets.ballmove, JSON.stringify({x: e.clientX, y:  e.clientY}));
    // };

    //socket.on(serverConfig.sockets.chat, addMessage);
    //socket.on(serverConfig.sockets.ballmove, setCoordinates);
    //document.addEventListener(serverConfig.sockets.ballmove, mouseMoveListener, false);

    //
    useEffect(() => {
        socket.on(serverConfig.sockets.chat, addMessage);
    },[]);

    // useEffect(() => {
    //     socket.on(serverConfig.sockets.ballmove, setCoordinates);
    // });

    // useEffect(() => {
    //     [canvasState]
    // }, [canvasState]);

    return (
        <div>
            <img src="gengar.jpg" alt="" />
            <ul id="messages">{messengerState.map((m,i) => (<li key ={i}>{m}</li>))}</ul>
            <form action="" onSubmit={onSubmitMsg}>
                {/* <label htmlFor="x">X:</label><input id="x" type="text" value={canvasState.x} onChange={e => setCanvasState({...canvasState, x: e.target.value})}/>
                <label htmlFor="y">Y:</label><input id="y" type="text" value={canvasState.y} onChange={e => setCanvasState({...canvasState, y: e.target.value})}/> */}
                <input type="text" id="m" value={message} onChange={e => setMessage(e.target.value)} autoComplete="off" /><button>Send</button>
            </form>
        </div>
    )
}

export default App;
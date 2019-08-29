import React, { useState, useEffect, useRef} from 'react';
import * as io from 'socket.io-client';
import serverConfig from './config/server';
import { Stage, Layer, Circle } from 'react-konva';


const socket = io(serverConfig.url);

function App(){

    const [message, setMessage] = useState('');
    const [messengerState, setMessengerState] = useState([]);
    const [mouseState, setMouseState] = useState({key:0, x:0, y:0});
    const [circlesState, setCirclesState] = useState([]);

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
        setMouseState({key: mousepos.key,  x: mousepos.x, y:mousepos.y});
    }

    const addRemoteCircle = (msg) => {
        let circlepos = JSON.parse(msg);
        setCirclesState(prevState => [...prevState, circlepos]);
    }

    const handleDragStart = e => {
        e.target.setAttrs({
          shadowOffset: {
            x: 3,
            y: 3
          },
          scaleX: 1.1,
          scaleY: 1.1
        });
      };
    const handleDragEnd = e => {
        e.target.to({
          duration: 0.5,
          easing: Konva.Easings.ElasticEaseOut,
          scaleX: 1,
          scaleY: 1,
          shadowOffsetX: 0,
          shadowOffsetY: 0
        });
      };

    const handleDragMove = e => {
        let x = e.target.x();
        let y = e.target.y();
        socket.emit(serverConfig.sockets.ballmove, JSON.stringify({key: e.target.index, x: e.target.x(), y:  e.target.y()}));
    }

    const addCircle = (e) => {
        e.preventDefault();
        let key = !circlesState ? 0 : circlesState.length;
        let newCirclePos = {key: key, x: Math.random() * 200, y: Math.random() * 200};
        setCirclesState(prevState => [...prevState, newCirclePos]);
        socket.emit(serverConfig.sockets.paintcircle, JSON.stringify(newCirclePos));
    }
 
    useEffect(() => {
        socket.on(serverConfig.sockets.chat, addMessage);
        socket.on(serverConfig.sockets.ballmove, setCoordinates);
        socket.on(serverConfig.sockets.paintcircle, addRemoteCircle);
    },[]);

    return (
        <div>
            <img src="gengar.jpg" alt="" />
            <Stage className="stage" width={window.innerWidth} height={window.innerHeight}>
                <Layer>
                {
                    circlesState.map((c, i) => 
                        <Circle key={c.key} 
                            x={c.x} 
                            y={c.y} 
                            fill="#89b717" 
                            draggable 
                            radius = {10}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                            onDragMove = {handleDragMove}
                        />)
                }
                </Layer>
            </Stage>

            <ul id="messages">{messengerState.map((m,i) => (<li key ={i}>{m}</li>))}</ul>
            <form action="" onSubmit={onSubmitMsg}>
                <label htmlFor="x">X:</label><input id="x" type="text" value={mouseState.x} readOnly />
                <label htmlFor="y">Y:</label><input id="y" type="text" value={mouseState.y} readOnly/>
                <label htmlFor="ix">Index:</label><input id="ix" type="text" value={mouseState.key} readOnly/>
                <input type="text" id="m" value={message} onChange={e => setMessage(e.target.value)} autoComplete="off" /><button>Send</button>
                <button id="btnAddCircle" onClick={addCircle}>Add Circlet</button>
            </form>
        </div>
    )
}

export default App;
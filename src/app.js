import React, { useState, useEffect, useRef} from 'react';
import * as io from 'socket.io-client';
import serverConfig from './config/server';
import {default as LCircle} from './models/circle';
import Konva from 'konva';
import { Stage, Layer, Circle } from 'react-konva';


const socket = io(serverConfig.url);

function App(){

    const [message, setMessage] = useState('');
    const [messengerState, setMessengerState] = useState([]);
    const [canvasState, setCanvasState] = useState({x:0, y:0});
    const [circlesState, setCirclesState] = useState([]);
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
        let circle = new LCircle(circlepos.x, circlepos.y, 10, 10, 2);
        let canvas = canvasRef.current;
        let ctx = canvas.getContext("2d");

        circle.paint(ctx, 'rgb(10,125,10)', 'rgb(255,255,100)');
    }

    const mouseMoveListener = (e) =>  {
        socket.emit(serverConfig.sockets.ballmove, JSON.stringify({x: e.clientX, y:  e.clientY}));
    };

    const handleDragStart = e => {
        // e.target.setAttrs({
        //   shadowOffset: {
        //     x: 15,
        //     y: 15
        //   },
        //   scaleX: 1.1,
        //   scaleY: 1.1
        // });
      };
    const handleDragEnd = e => {
        // e.target.to({
        //   duration: 0.5,
        //   easing: Konva.Easings.ElasticEaseOut,
        //   scaleX: 1,
        //   scaleY: 1,
        //   shadowOffsetX: 5,
        //   shadowOffsetY: 5
        // });
      };


    const addCircle = (e) => {
        e.preventDefault();
        let circle = new LCircle(0, 0, 10, 10, 2);
        let canvas = canvasRef.current;
        let ctx = canvas.getContext("2d");

        circle.paint(ctx, 'rgb(255,125,10)', 'rgb(0,255,100)');
        setCirclesState(prevState => [...prevState, {x: Math.random() * 200, y: Math.random() * 200}]);
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
            <canvas id="stage" ref={canvasRef} width={200} height={200}/>
            <Stage id="konva-stage" width={200} height={200}>
                <Layer>
                {
                    circlesState.map((c,i) => 
                        <Circle key={i} 
                            x={c.x} 
                            y={c.y} 
                            fill="#89b717" 
                            draggable 
                            radius = {10}
                            onDragStart={handleDragStart}
                            onDragEnd={handleDragEnd}
                        />)
                }
                </Layer>
            </Stage>

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
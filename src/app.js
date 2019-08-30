import React, { useState, useEffect, createRef} from 'react';
import * as io from 'socket.io-client';
import serverConfig from './config/server';
import { Stage, Layer, Circle } from 'react-konva';


const socket = io(serverConfig.url);

function App(){

    const [message, setMessage] = useState('');
    const [messengerState, setMessengerState] = useState([]);
    const [ballDragState, setBallDragState] = useState({index: 0, key:-1, x:0, y:0});
    const [circlesState, setCirclesState] = useState([]);
    const refStage = createRef();

    //Msg Stuff
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

    //on Drag Start/End
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

    //Drag Circle
    const handleDragMove = e => {
        let x = e.target.x();
        let y = e.target.y();
        let currentCirclePos = {id: `circle-${e.target.index}`, index: e.target.index, x: e.target.x(), y:  e.target.y()};
        socket.emit(serverConfig.sockets.ballmove, JSON.stringify(currentCirclePos));
    }

    const handleDragMoveRemote = (msg) => {
        let circlepos = JSON.parse(msg);
        setCirclesState(prevState => {
            return [...prevState.slice(0,circlepos.index), circlepos, ...prevState.slice(circlepos.index + 1)];
        });
        setBallDragState({index: circlepos.index,  x: circlepos.x, y:circlepos.y});
    }

    //Add Circlecir
    const addCircle = (e) => {
        e.preventDefault();
        let index = !circlesState ? 0 : circlesState.length;
        let newCirclePos = {id: `circle-${index}`, index: index, x: Math.random() * 200, y: Math.random() * 200};
        setCirclesState(prevState => [...prevState, newCirclePos]);
        socket.emit(serverConfig.sockets.paintcircle, JSON.stringify(newCirclePos));
    }
    const addCircleFromRemote = (msg) => {
        let newCirclePos = JSON.parse(msg);
        setCirclesState(prevState => [...prevState, newCirclePos]);
    }
 
    useEffect(() => {
        socket.on(serverConfig.sockets.chat, addMessage);
        socket.on(serverConfig.sockets.ballmove, handleDragMoveRemote);
        socket.on(serverConfig.sockets.paintcircle, addCircleFromRemote);
    },[]);

    return (
        <div>
            <img src="gengar.jpg" alt="" />
            <Stage className="stage" width={window.innerWidth} height={500} ref={refStage}>
                <Layer>
                {
                    circlesState.map((c, i) => 
                        <Circle key={i}
                            id={c.id} 
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
                <label htmlFor="x">X:</label><input id="x" type="text" value={ballDragState.x} readOnly />
                <label htmlFor="y">Y:</label><input id="y" type="text" value={ballDragState.y} readOnly/>
                <label htmlFor="ix">Index:</label><input id="ix" type="text" value={ballDragState.index} readOnly/>
                <input type="text" id="m" value={message} onChange={e => setMessage(e.target.value)} autoComplete="off" /><button>Send</button>
                <button id="btnAddCircle" onClick={addCircle}>Add Circlet</button>
            </form>
        </div>
    )
}

export default App;
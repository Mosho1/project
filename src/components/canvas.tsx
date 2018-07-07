import React from "react";
import { values } from "mobx";
import { observer } from "mobx-react";

import BoxView from "./box-view";
import { Component } from './component';
import { Layer, Stage, Line } from 'react-konva';
class Canvas extends Component<any> {
    render() {
        const { store } = this;
        const { draggedArrow } = store;
        return (
            <Stage
                onClick={this.onCanvasClick}
                width={window.innerWidth}
                height={window.innerHeight}
                onMouseMove={this.onMouseMove}
                onMouseUp={this.onMouseUp}
            >
                <Layer>
                    {draggedArrow && <Line
                        points={draggedArrow.points}
                        stroke="black"
                        bezier
                    />}
                    {values(store.arrows).map(a =>
                        // <Group key={a._id}>
                        // {chunk<number>(a.points, 2).map(x => <Circle fill="black" x={x[0]} y={x[1]} radius={5}/>)}
                        <Line
                            key={a._id}
                            points={a.points}
                            stroke={a.isExec ? '#dacfcf' : 'green'}
                            bezier
                        />
                        // </Group> 
                    )}
                    {values(store.boxes).map(b => <BoxView key={b._id} box={b} />)}
                </Layer>
            </Stage>

        );
    }

    onMouseUp = () => {
        this.store.endDragArrow();
    };

    onMouseMove = ({ evt }: any) => {
        if (this.store.draggedArrow) {
            this.store.moveDragArrow(evt.clientX, evt.clientY);
        }
    };

    onCanvasClick = ({ evt: e }: any) => {
        const { store } = this;
        if (e.ctrlKey === false) {
            store.setSelection(null);
        } else {
            store.createBox("Hi.", e.clientX - 50, e.clientY - 20);
        }
    }
}

export default observer(Canvas)

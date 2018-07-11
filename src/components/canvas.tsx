import * as React from "react";
import { observer } from "mobx-react";

import BoxView from "./box-view";
import { Component } from './component';
import { Layer, Stage, Line } from 'react-konva';
import { values } from '../stores/utils/utils';
import { Key } from 'ts-keycode-enum';
class Canvas extends Component<any> {


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
            store.setSelection([]);
        }
        //  else {
        //     store.createBox("Hi.", e.clientX - 50, e.clientY - 20);
        // }
    }

    onCanvasKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation();
        switch (e.which) {
            case Key.Delete:
                return this.store.deleteSelection();
        }
    };

    render() {
        const { store } = this;
        const { draggedArrow } = store;
        return (
            <div tabIndex={0} onKeyUp={this.onCanvasKeyPress}>
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
                                stroke={a.isExec ? '#dacfcf' : a.color}
                                bezier
                            />
                            // </Group> 
                        )}
                        {values(store.boxes).map(b => <BoxView key={b._id} box={b} />)}
                    </Layer>
                </Stage>
            </div>
        );
    }
}

export default observer(Canvas)

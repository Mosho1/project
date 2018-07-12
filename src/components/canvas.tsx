import * as React from "react";
import { observer } from "mobx-react";

import BoxView from "./box-view";
import { Component } from './component';
import { Layer, Stage, Line } from 'react-konva';
import { values } from '../stores/utils/utils';
import { Key } from 'ts-keycode-enum';
class Canvas extends Component<any> {


    onMouseUp = ({ evt }: KonvaEvent) => {
        this.store.endDragArrow(evt.clientX, evt.clientY);
    };

    onMouseMove = ({ evt }: KonvaEvent) => {
        if (this.store.draggedArrow) {
            this.store.moveDragArrow(evt.clientX, evt.clientY);
        }
    };

    onCanvasClick = ({ evt: e }: KonvaEvent) => {
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

    onWheel = ({ evt: e }: KonvaEvent<WheelEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        this.store.stage.handleScale(e);
    };

    dragStartX: number = 0;
    dragStartY: number = 0;

    handleDragStart = ({ evt }: { evt: DragEvent }) => {
        this.dragStartX = evt.clientX;
        this.dragStartY = evt.clientY;
    };

    handleDragMove = ({ evt }: { evt: DragEvent }) => {
        this.store.stage.move(
            evt.clientX - this.dragStartX,
            evt.clientY - this.dragStartY
        );
        this.dragStartX = evt.clientX;
        this.dragStartY = evt.clientY;
    };

    render() {
        const { store } = this;
        const { draggedArrow } = store;
        return (
            <div tabIndex={0} onKeyUp={this.onCanvasKeyPress}>
                <Stage
                x={store.stage.position.x}
                y={store.stage.position.y}
                    scaleX={store.stage.scale}
                    scaleY={store.stage.scale}
                    onDragMove={this.handleDragMove}
                    onDragStart={this.handleDragStart}
                    dragBoundFunc={_ => store.stage.position}
                    draggable
                    onClick={this.onCanvasClick}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    onMouseMove={this.onMouseMove}
                    onMouseUp={this.onMouseUp}
                    onWheel={this.onWheel}
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

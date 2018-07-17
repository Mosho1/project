import * as React from "react";
import { observer } from "mobx-react";

import BoxView from "./box-view";
import { Component } from './component';
import { Layer, Stage, Line, Rect } from 'react-konva';
import { values } from '../stores/utils/utils';
import { Key } from 'ts-keycode-enum';
import ArrowView from './arrow-view';

@observer
class Canvas extends Component<any> {


    onMouseUp = (_e: KonvaEvent) => {
        if (this.store.draggedArrow) {
            this.store.endDragArrow(null, _e.evt.clientX, _e.evt.clientY);
        }
        if (this.store.draggedRect) {
            this.store.endDragRect();
        } else if (_e.evt.ctrlKey === false) {
            this.store.setSelection([]);
        }
    };

    onMouseMove = ({ evt }: KonvaEvent) => {
        evt;
    };

    onCanvasClick = (_e: KonvaEvent) => {
        if (this.store.draggedRect) {
            this.store.endDragRect();
        }
        //  else if (e.ctrlKey === false) {
        //     store.setSelection([]);
        // }
    }

    onCanvasKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        let caught = false;

        switch (e.which) {
            case Key.Delete:
                this.store.deleteSelection();
                caught = true;
                break;
            case Key.F8:
                if (this.store.running) {
                    this.store.runCode();
                    caught = true;
                }
                break;
            case Key.F5:
                if (!this.store.running) {
                    return this.store.runCode();
                    caught = true;
                }
                break;
            case Key.R:
                if (!e.ctrlKey && e.shiftKey) {
                    this.store.stopCode();
                    return this.store.runCode();
                    caught = true;
                }
                break;
            case Key.F7:
                if (e.shiftKey) {
                    this.store.stopCode();
                    caught = true;
                }
                break;
        }


        if (caught) {
            e.stopPropagation();
            e.preventDefault();
        }
    };

    // onWheel = ({ evt: e }: KonvaEvent<WheelEvent>) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     this.store.stage.handleScale(e);
    // };

    dragStartX: number = 0;
    dragStartY: number = 0;

    handleDragStart = ({ evt }: { evt: DragEvent }) => {
        this.dragStartX = evt.clientX;
        this.dragStartY = evt.clientY;
        if (evt.shiftKey) {
            this.store.startDragRect(evt.clientX, evt.clientY);
        }
    };

    handleDragMove = ({ evt }: { evt: DragEvent }) => {
        const [x, y] = [evt.clientX - this.dragStartX, evt.clientY - this.dragStartY];
        if (this.store.draggedArrow) {
            this.store.moveDragArrow(x, y);
        } else if (evt.shiftKey) {
            this.store.moveDragRect(x, y);
        } else {
            this.store.stage.move(x, y);
        }
        this.dragStartX = evt.clientX;
        this.dragStartY = evt.clientY;
    };

    render() {
        const { store } = this;
        const { draggedArrow, draggedRect, draggedFromSocket } = store;
        return (
            <div
                tabIndex={0}
                onKeyDown={this.onCanvasKeyPress}
            >
                <Stage
                    x={store.stage.position.x}
                    y={store.stage.position.y}
                    scaleX={store.stage.scale}
                    scaleY={store.stage.scale}
                    onDragMove={this.handleDragMove}
                    onDragStart={this.handleDragStart}
                    dragBoundFunc={_ => store.stage.position}
                    draggable
                    width={window.innerWidth}
                    height={window.innerHeight}
                    onMouseMove={this.onMouseMove}
                    onMouseUp={this.onMouseUp}
                    onClick={this.onCanvasClick}
                // onWheel={this.onWheel}
                >
                    <Layer>
                        {draggedArrow && <Line
                            points={draggedArrow.points}
                            stroke={draggedFromSocket ? draggedFromSocket.color : 'black'}
                            bezier
                        />}

                        {draggedRect && <Rect
                            stroke="#E0E0E0"
                            strokeWidth={1}
                            width={draggedRect.width}
                            height={draggedRect.height}
                            {...draggedRect.absoluteCoords}
                        />}

                        {values(store.arrows).map(a => <ArrowView key={a._id} arrow={a} />)}
                        {values(store.boxes).map(b => <BoxView key={b._id} box={b} />)}
                    </Layer>
                </Stage>
            </div >
        );
    }
}

export default Canvas;

import * as React from "react";
import { observer } from "mobx-react";

import BoxView from "./box-view";
import { Component } from './component';
import { Layer, Stage } from 'react-konva';
import { values } from '../stores/utils/utils';
import { Key } from 'ts-keycode-enum';

@observer
class Canvas extends Component<any> {


    onMouseUp = (_e: KonvaEvent) => {
    };

    onMouseMove = ({ evt }: KonvaEvent) => {
        evt;
    };

    onCanvasClick = ({ evt: e }: KonvaEvent) => {
        const { store } = this;
        if (e.ctrlKey === false) {
            store.setSelection([]);
        }
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
    };

    dragStartX: number = 0;
    dragStartY: number = 0;

    handleDragStart = ({ evt }: { evt: DragEvent }) => {
        this.dragStartX = evt.clientX;
        this.dragStartY = evt.clientY;
    };

    render() {
        const { store } = this;
        return (
            <div tabIndex={0} onKeyDown={this.onCanvasKeyPress}>
                <Stage
                    onClick={this.onCanvasClick}
                    width={window.innerWidth}
                    height={window.innerHeight}
                    onMouseMove={this.onMouseMove}
                    onMouseUp={this.onMouseUp}
                    onWheel={this.onWheel}
                >
                    <Layer>
                        {values(store.boxes).map(b => <BoxView key={b._id} box={b} />)}
                    </Layer>
                </Stage>
            </div>
        );
    }
}

export default Canvas;

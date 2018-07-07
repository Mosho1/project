import React from "react";
import { values } from "mobx";
import { observer } from "mobx-react";

import BoxView from "./box-view";
import Sidebar from "./sidebar";
import * as styles from './styles/index.css';
import FunStuff from "./fun-stuff";
import { Component } from './component';
import { Layer, Stage, Rect, Line } from 'react-konva';

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
                    {values(store.boxes).map(b => <BoxView key={b._id} box={b} />)}
                    {draggedArrow && <Line
                        points={draggedArrow.points}
                        fill="black"
                        stroke="black"
                        bezier
                    />}
                </Layer>
            </Stage>

            // <div className={styles.app}>
            //     <div className={styles.canvas} onClick={this.onCanvasClick}>
            //         <svg>
            //             {values(store.arrows).map(arrow => <ArrowView arrow={arrow} key={arrow._id} />)}
            //         </svg>
            //         {values(store.boxes).map(box => (
            //             <BoxView box={box} key={box._id} />
            //         ))}
            //     </div>
            //     <Sidebar />
            //     <FunStuff />
            // </div>
        );
    }

    //    onMouseDown = ({ evt }) => {
    //        this.store.startDragArrow(evt.clientX, evt.clientY);
    //    };
    //
    onMouseUp = () => {
        this.store.endDragArrow();
    };

    onMouseMove = ({ evt }: any) => {
        if (this.store.draggedArrow) {
            this.store.draggedArrow.end(evt.clientX, evt.clientY);
        }
    };

    onCanvasClick = ({ evt: e }: any) => {
        const { store } = this;
        if (e.ctrlKey === false) {
            store.setSelection(null);
        } else {
            store.createBox("Hi.", e.clientX - 50, e.clientY - 20, store.selection);
        }
    }
}

export default observer(Canvas)

import * as React from "react";
import { observer } from "mobx-react";

import BoxView from "./box-view";
import { Component } from './component';
import { Layer, Stage } from 'react-konva';
import { values } from '../stores/utils/utils';
import { Key } from 'ts-keycode-enum';

@observer
class Canvas extends Component<any> {


    onCanvasKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation();
        switch (e.which) {
            case Key.Delete:
                return this.store.deleteSelection();
        }
    };

    render() {
        const { store } = this;
        return (
            <div tabIndex={0} onKeyDown={this.onCanvasKeyPress}>
                <Stage
                    width={window.innerWidth}
                    height={window.innerHeight}
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

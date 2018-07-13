import * as React from "react"
import { observer } from "mobx-react"
import { Component } from './component';
import { Rect, Group } from 'react-konva';
import { IBox } from '../stores/models/box';

@observer
export class BoxView extends Component<{ box: IBox }> {
    handleClick = (evt: { evt: MouseEvent, cancelBubble: boolean }) => {
        const { box } = this.props;
        this.store.setSelection([box]);
        evt.cancelBubble = true;
    };

    render() {
        const { box } = this.props;
        return (
            <Group>
                <Rect
                    ref="rect"
                    x={box.x}
                    y={box.y}
                    width={box.width}
                    height={box.height}
                    fill={box.isSelected ? '#4150b5' : '#42515f'}
                    shadowBlur={4}
                    shadowOffsetX={1}
                    shadowOffsetY={5}
                    cornerRadius={10}
                    opacity={0.4}
                    draggable
                    onClick={this.handleClick}
                />
            </Group>
        );
    }

}

export default BoxView;

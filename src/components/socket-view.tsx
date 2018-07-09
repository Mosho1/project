import * as React from "react"
import { observer } from "mobx-react"
import { Component } from './component';
import { Rect, Group, Circle, Text } from 'react-konva';
import { ISocket } from '../stores/models/socket';

@observer
export class SocketView extends Component<{ socket: ISocket }> {

    onMouseDown = (e: KonvaEvent) => {
        if (!e.evt.ctrlKey) {
            this.store.startDragArrow(this.props.socket);
        }
    };

    onMouseUp = (e: KonvaEvent) => {
        this.store.endDragArrow(this.props.socket);
        e.cancelBubble = true;
    };

    onClick = (e: KonvaEvent) => {
        if (e.evt.ctrlKey) {
            this.store.deleteArrowsForSocket(this.props.socket);
        }
        e.cancelBubble = true;
    };

    renderExecSocket() {
        const { x, y, arrows } = this.props.socket;
        return <Rect
            x={x - 6}
            y={y - 6}
            height={12}
            width={12}
            fill={arrows.length > 0 ? '#dacfcf' : 'black'}
            stroke={'#dacfcf'}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            onClick={this.onClick}
        />
    }

    renderSocket() {
        
        const { x, y, arrows } = this.props.socket;

        return <Circle
            x={x}
            y={y}
            radius={6}
            fill={arrows.length > 0 ? 'green' : 'black'}
            stroke={'green'}
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            onClick={this.onClick}
        />
    }

    render() {
        const { x, y, name, socketType, isExec } = this.props.socket;
        return <Group>
            {isExec ? this.renderExecSocket() : this.renderSocket()}
            <Text
                x={x + (socketType === 'input' ? 15 : -40)}
                y={y - 5}
                fill={'#fff'}
                text={name}
            />
        </Group>
    }
}
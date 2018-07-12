import * as React from "react"
import { observer } from "mobx-react"
import { Component } from './component';
import { Rect, Group, Circle, Text } from 'react-konva';
import { ISocket } from '../stores/models/socket';

@observer
export class SocketView extends Component<{ socket: ISocket }, { hovered: boolean }> {

    state = { hovered: false };

    onMouseDown = (e: KonvaEvent) => {
        if (!e.evt.ctrlKey) {
            this.store.startDragArrow(this.props.socket);
        }
    };

    onMouseUp = (e: KonvaEvent) => {
        this.store.endDragArrow(e.evt.clientX, e.evt.clientY, this.props.socket);
        e.cancelBubble = true;
    };

    onClick = (e: KonvaEvent) => {
        if (e.evt.ctrlKey) {
            this.store.deleteArrowsForSocket(this.props.socket);
        }
        e.cancelBubble = true;
    };

    onMouseEnter = (_e: KonvaEvent) => {
        this.setState({hovered: true});
    };

    onMouseLeave = (_e: KonvaEvent) => {
        this.setState({hovered: false});
    };

    get size() {
        return this.state.hovered ? 8 : 6;
    }

    renderExecSocket() {
        const { x, y, arrows } = this.props.socket;
        return <Rect
            x={x - this.size}
            y={y - this.size}
            height={this.size * 2}
            width={this.size * 2}
            fill={arrows.length > 0 ? '#dacfcf' : 'black'}
            stroke={'#dacfcf'}
        />
    }

    renderSocket() {

        const { x, y, arrows, color, fillColor } = this.props.socket;

        return <Circle
            x={x}
            y={y}
            radius={this.size}
            fill={arrows.length > 0 ? fillColor : 'black'}
            stroke={color}

        />
    }

    render() {
        const { x, y, name, socketType, isExec } = this.props.socket;
        return <Group
            onMouseDown={this.onMouseDown}
            onMouseUp={this.onMouseUp}
            onClick={this.onClick}
            onMouseEnter={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
        >
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
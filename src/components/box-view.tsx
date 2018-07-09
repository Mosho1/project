import * as React from "react"
import { observer } from "mobx-react"
import { Component } from './component';
import { Rect, Group, Text } from 'react-konva';
import { ISocket } from '../stores/models/socket';
import { IBox } from '../stores/models/box';
import { SocketView } from './socket-view';

@observer
export class BoxView extends Component<{ box: IBox }> {
    handleClick = (evt: { evt: MouseEvent, cancelBubble: boolean }) => {
        const e = evt.evt;
        if (e.ctrlKey) {
            if (this.store.selection === this.props.box) {
                this.store.setSelection(null);
            }
            this.store.deleteBox(this.props.box);
        } else {
            this.store.setSelection(this.props.box);
        }
        evt.cancelBubble = true;
    };

    dragStartX: number = 0;
    dragStartY: number = 0;

    handleDragStart = ({ evt }: { evt: DragEvent }) => {
        this.dragStartX = evt.clientX;
        this.dragStartY = evt.clientY;
    };

    handleDragMove = ({ evt }: { evt: DragEvent }) => {
        this.props.box.move(evt.clientX - this.dragStartX, evt.clientY - this.dragStartY);
        this.dragStartX = evt.clientX;
        this.dragStartY = evt.clientY;
    };

    socketView = (s: ISocket) =>
        <SocketView
            socket={s}
            key={s.id}
        />

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
                    onDragMove={this.handleDragMove}
                    onDragStart={this.handleDragStart}
                    dragBoundFunc={_ => box}
                    onClick={this.handleClick}
                />
                <Text
                    x={box.x}
                    y={box.y + 12}
                    fill={'#fff'}
                    text={`${box.name}${box.value !== null ? ` (${box.value})` : ''}`}
                    align="center"
                    width={box.width}
                />
                {box.sockets.map(this.socketView)}
            </Group>
        );
    }

}

export default BoxView;

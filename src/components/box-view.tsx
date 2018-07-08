import React from "react"
import { observer } from "mobx-react"
import { Component } from './component';
import { Rect, Group } from 'react-konva';
import { SocketType } from '../stores/models/socket';
import { BoxType } from '../stores/models/box';
import { SocketView } from './socket-view';

@observer
export class BoxView extends Component<{ box: BoxType }> {
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

    socketView = (s: SocketType) =>
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
                    // onTransform={this.handleTransform}
                    onDragMove={this.handleDragMove}
                    onDragStart={this.handleDragStart}
                    onClick={this.handleClick}
                />
                {box.sockets.map(this.socketView)}
                {/* {box.isSelected && <Transformer onClick={e => e.cancelBubble = true} ref={this.attachTransformer} />} */}
            </Group>
        );
    }

}

export default BoxView;

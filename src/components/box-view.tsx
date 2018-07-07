import React from "react"
import { observer } from "mobx-react"
import { Component } from './component';
import { Rect, Group, Circle, Text } from 'react-konva';
import { SocketType } from '../stores/models/socket';
import { BoxType } from '../stores/models/box';

@observer
class SocketView extends Component<{ socket: SocketType }> {

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

    render() {
        const { x, y, name, socketType, arrows } = this.props.socket;
        return <Group>
            <Circle
                x={x}
                y={y}
                radius={6}
                fill={arrows.length > 0 ? 'green' : 'black'}
                stroke={'green'}
                onMouseDown={this.onMouseDown}
                onMouseUp={this.onMouseUp}
                onClick={this.onClick}
            />
            <Text
                x={x + (socketType === 'input' ? 15 : -40)}
                y={y - 5}
                fill={'#fff'}
                text={name}
            />
        </Group>
    }
}

@observer
class BoxView extends Component<{ box: BoxType }> {
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

    // attachTransformer = node => {
    //     if (node) {
    //         node.attachTo(this.refs.rect);
    //     }
    // };

    // handleTransform = (evt) => {
    //     const attrs = evt.target.attrs;
    //     const { box } = this.props;

    //     box.setProps({
    //         scaleX: attrs.scaleX,
    //         scaleY: attrs.scaleY,
    //         x: attrs.x,
    //         y: attrs.y
    //     })
    // };

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
                {box.leftSockets.map((s) =>
                    <SocketView
                        socket={s}
                        key={s.id}
                    />
                )}
                {box.rightSockets.map(s =>
                    <SocketView
                        socket={s}
                        key={s.id}
                    />
                )}
                {/* {box.isSelected && <Transformer onClick={e => e.cancelBubble = true} ref={this.attachTransformer} />} */}
            </Group>
        );
    }

}

export default BoxView;

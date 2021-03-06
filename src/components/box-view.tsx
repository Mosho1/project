import * as React from "react"
import { observer } from "mobx-react"
import { Component } from './component';
import { Rect, Group, Text } from 'react-konva';
import { ISocket } from '../stores/models/socket';
import { IBox, IBoxValue } from '../stores/models/box';
import { SocketView } from './socket-view';

@observer
class BoxValueView extends Component<{ boxValue: IBoxValue }> {
    render() {
        const { name, value, x, y, width } = this.props.boxValue;

        return <Text
            x={x}
            y={y}
            fill={'#fff'}
            text={`${name}: ${value}`}
            align="center"
            width={width}
        />;
    }
}

@observer
export class BoxView extends Component<{ box: IBox }> {
    handleClick = (evt: { evt: MouseEvent, cancelBubble: boolean }) => {
        const { box } = this.props;
        if (evt.evt.ctrlKey) {
            this.store.addToSelection([box])
        } else {
            this.store.setSelection([box]);
        }
        evt.cancelBubble = true;
    };

    dragStartX: number = 0;
    dragStartY: number = 0;

    handleDragStart = (e: KonvaEvent) => {
        e.cancelBubble = true;
        this.dragStartX = e.evt.clientX;
        this.dragStartY = e.evt.clientY;
    };

    handleDragMove = (e: KonvaEvent) => {
        e.cancelBubble = true;
        this.store.moveBoxOrSelection(
            this.props.box,
            e.evt.clientX - this.dragStartX,
            e.evt.clientY - this.dragStartY
        );
        this.dragStartX = e.evt.clientX;
        this.dragStartY = e.evt.clientY;
    };

    socketView = (s: ISocket) =>
        <SocketView
            socket={s}
            key={s._id}
        />

    boxValueView = (v: IBoxValue, i: number) =>
        <BoxValueView
            boxValue={v}
            key={i}
        />

    get fill() {
        const { box } = this.props;
        if (box.isBreaking) {
            return '#d50000'
        }
        if (box.isSelected) {
            return '#4150b5'
        }
        return '#42515f';
    }

    onMouseUp = (e: KonvaEvent) => {
        if (!this.store.draggedArrow && !this.store.draggedRect) {
            e.cancelBubble = true;
        }
    }

    render() {
        const { box } = this.props;
        return (
            <Group
                onDragMove={this.handleDragMove}
                onDragStart={this.handleDragStart}
                onClick={this.handleClick}
                onMouseUp={this.onMouseUp}
                x={box.x}
                y={box.y}
                draggable
            // dragBoundFunc={_ => console.log(box.x, box.y)||box}
            >
                <Rect
                    ref="rect"
                    width={box.width}
                    height={box.height}
                    fill={this.fill}
                    shadowBlur={4}
                    stroke={box.breakpoint ? '#f44336' : ''}
                    strokeWidth={4}
                    shadowOffsetX={1}
                    shadowOffsetY={5}
                    cornerRadius={10}
                    opacity={.45}
                />
                <Text
                    x={0}
                    y={12}
                    fill={'#fff'}
                    text={box.name}
                    align="center"
                    width={box.width}
                />
                {box.values.map(this.boxValueView)}
                {box.sockets.map(this.socketView)}
            </Group>
        );
    }

}

export default BoxView;

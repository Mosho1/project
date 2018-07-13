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
                    // dragBoundFunc={_ => console.log(box.x, box.y)||box}
                    onClick={this.handleClick}
                />
                <Text
                    x={box.x}
                    y={box.y + 12}
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

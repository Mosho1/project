import React from "react"
import { observer } from "mobx-react"
import * as styles from './styles/index.css';
import { Component } from './component';
import { Rect, Group, Transformer, Circle } from 'react-konva';
import { BoxType } from '../stores/domain-state';

class SocketView extends Component<{ x: number, y: number }> {

    onMouseDown = () => {
        this.store.startDragArrow(this.props.x, this.props.y);
    };

    render() {
        const { x, y } = this.props;
        return <Circle
            x={x}
            y={y}
            radius={10}
            fill={'red'}
            onMouseDown={this.onMouseDown}
        />
    }
}

class BoxView extends Component<{ box: BoxType }> {
    handleClick = (evt: {evt: MouseEvent, cancelBubble: boolean}) => {
        const e = evt.evt;
        if (e.ctrlKey) {
            if (this.store.selection === this.props.box) {
                this.store.setSelection(null);
            }
            this.store.deleteBox(this.props.box._id);
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
    //     });
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
                    fill={box.isSelected ? 'red' : 'blue'}
                    shadowBlur={5}
                    draggable
                    // onTransform={this.handleTransform}
                    onDragMove={this.handleDragMove}
                    onDragStart={this.handleDragStart}
                    onClick={this.handleClick}
                />
                {box.leftSockets.map(s =>
                    <SocketView
                        key={s._id}
                        x={box.x + 18}
                        y={box.y + box.height / 2}
                    />
                )}
                {box.rightSockets.map(s =>
                    <SocketView
                        key={s._id}
                        x={box.x + box.width - 18}
                        y={box.y + box.height / 2}
                    />
                )}
                {/* {box.isSelected && <Transformer onClick={e => e.cancelBubble = true} ref={this.attachTransformer} />} */}
            </Group>
        );
    }

}

export default observer(BoxView)

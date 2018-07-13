import * as React from "react"
import { observer } from "mobx-react"
import { Rect, Group } from 'react-konva';
import { IBox } from '../stores/models/box';
import { IStore } from '../stores/domain-state';

@observer
export class BoxView extends React.Component<{ box: IBox, store: IStore }> {
    handleClick = (evt: { evt: MouseEvent, cancelBubble: boolean }) => {
        const { box } = this.props;
        this.props.store.setSelection([box]);
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

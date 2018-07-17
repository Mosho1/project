import * as React from "react"
import { observer } from "mobx-react"
import { Component } from './component';
import { Line } from 'react-konva';
import { Line as KonvaLine, Easings } from 'konva';
import { IArrow } from '../stores/models/arrow';

@observer
export class ArrowView extends Component<{ arrow: IArrow }> {

    line: KonvaLine | null = null;

    onEmit = () => {
        const { line } = this;
        if (!line) return;
        line.to({
            strokeWidth: 10,
            duration: 0.1,
            easing: Easings.EaseInOut,
            onFinish: () => {
                line.to({
                    strokeWidth: 2,
                    duration: 0.5,
                    easing: Easings.EaseInOut,
                })
            }
        })
    }

    componentDidMount() {
        this.props.arrow.setOnEmit(this.onEmit);
    }

    render() {
        const { arrow: a } = this.props;
        return (<Line
            ref={ref => this.line = ref as any}
            key={a._id}
            points={a.points}
            stroke={a.isExec ? '#dacfcf' : a.color}
            bezier
        />);
    }

}

export default ArrowView;
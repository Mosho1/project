import * as React from "react"
import { observer } from "mobx-react"
import { IBox } from '../stores/models/box';
import { IStore } from '../stores/domain-state';

@observer
export class BoxView extends React.Component<{ box: IBox, store: IStore }> {
    handleClick = () => {
        const { box } = this.props;
        this.props.store.setSelection([box]);
    };

    render() {
        const { box } = this.props;
        return (<div
            onClick={this.handleClick}
            style={{ height: box.x, width: box.y, background: 'red' }}>
        </div>);
    }

}

export default BoxView;

import * as React from "react";
import { observer } from "mobx-react";

import BoxView from "./box-view";
import { values } from '../stores/utils/utils';
import { Key } from 'ts-keycode-enum';
import { IStore } from '../stores/domain-state';

@observer
class Canvas extends React.Component<{store: IStore}> {


    onCanvasKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
        e.stopPropagation();
        switch (e.which) {
            case Key.Delete:
                return this.props.store.deleteSelection();
        }
    };

    render() {
        const { store } = this.props;
        return (
            <div tabIndex={0} onKeyDown={this.onCanvasKeyPress}>
                        {values(store.boxes).map(b => <BoxView store={store} key={b._id} box={b} />)}
            </div>
        );
    }
}

export default Canvas;

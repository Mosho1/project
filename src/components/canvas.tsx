import React, { Component } from "react"
import { values } from "mobx"
import { observer } from "mobx-react"
import DevTools from "mobx-react-devtools"

import BoxView from "./box-view"
import ArrowView from "./arrow-view"
import Sidebar from "./sidebar"
import * as styles from './styles/index.css';

class Canvas extends Component<{ store: any }> {
    render() {
        const { store } = this.props;
        return (
            <div className={styles.app}>
                <div className={styles.canvas} onClick={this.onCanvasClick}>
                    <svg>
                        {store.arrows.map(arrow => <ArrowView arrow={arrow} key={arrow.id} />)}
                    </svg>
                    {values(store.boxes).map(box => (
                        <BoxView box={box} store={store} key={box.id} />
                    ))}
                </div>
                <Sidebar store={store} />
                <DevTools />
            </div>
        );
    }

    onCanvasClick = e => {
        const { store } = this.props;
        if (e.ctrlKey === false) {
            store.setSelection(null);
        } else {
            store.createBox("Hi.", e.clientX - 50, e.clientY - 20, store.selection);
        }
    }
}

export default observer(Canvas)

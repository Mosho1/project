import React, { Component } from "react"
import { observer } from "mobx-react"
import * as styles from './styles/index.css';

class Sidebar extends Component<{store: any}> {
    render() {
        const { selection } = this.props.store
        return selection ? (
            <div className={`${styles.sidebar} ${styles.sidebarOpen}`}>
                <small>(control click the canvas to create new boxes)</small>
                <hr />
                Caption:
                <input onChange={this.onChange} value={selection.name} />
            </div>
        ) : (
            <div className={styles.sidebar} />
        )
    }

    onChange = e => {
        this.props.store.selection.setName(e.target.value)
    }
}

export default observer(Sidebar)

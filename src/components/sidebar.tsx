import React from "react"
import { observer } from "mobx-react"
import * as styles from './styles/index.css';
import Component from './component';

class Sidebar extends Component {
    render() {
        const { selection } = this.store
        return selection ? (
            <div className={`${styles.sidebar} ${styles.sidebarOpen}`}>
                <small>(control click the caenvas to create new boxes)</small>
                <hr />
                Caption:
                <input onChange={this.onChange} value={selection.name} />
            </div>
        ) : (
            <div className={styles.sidebar} />
        )
    }

    onChange = (e: any) => {
        this.props.store.selection.setName(e.target.value)
    }
}

export default observer(Sidebar)

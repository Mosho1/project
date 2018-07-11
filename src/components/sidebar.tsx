import * as React from "react"
import { observer } from "mobx-react"
import * as styles from './styles/index.css';
import Component from './component';
import { ISocket } from '../stores/models/socket';

class Sidebar extends Component {
    onSocketNameChange = (socket: ISocket) => (e: React.ChangeEvent<HTMLInputElement>) => {
        socket.setName(e.target.value);
    };

    getSocketInput = (s: ISocket) => {
        return <input onChange={this.onSocketNameChange(s)} defaultValue={s.name} key={s._id} />;
    };

    onValueChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const { selection } = this.store;
        selection[0]!.setValue(name, e.target.value);
    };

    render() {
        const { selection } = this.store
        return selection.length === 1 ? (
            <div className={`${styles.sidebar} ${styles.sidebarOpen}`}>
                {selection[0].name}
                <hr />
                {selection[0].values.map((v, i) => <div key={i}>
                    {v.name}: <input defaultValue={v.value || ''} onChange={this.onValueChange(v.name)} />
                </div>)}
            </div>
        ) : (
                <div className={styles.sidebar} />
            )
    }
}

export default observer(Sidebar)

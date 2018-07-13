import * as React from "react"
import { observer } from "mobx-react"
import * as styles from './styles/topbar.css';
import Component from './component';
import Button from '@material-ui/core/Button';

@observer
class Sidebar extends Component {
    topbar: HTMLDivElement | null = null;
    componentDidMount() {
        if (this.topbar) this.topbar.addEventListener('contextmenu', (e: any) => {
            e.stopPropagation();
        });
    }

    play = () => {
        this.store.runCode();
    }

    stop = () => {
        this.store.stopCode();
    }

    render() {
        return <div ref={ref => this.topbar = ref} className={`${styles.topbar}`}>
            <Button onClick={this.play} className={styles.button} variant="contained">Play</Button>
            <Button onClick={this.stop} className={styles.button} variant="contained">Stop</Button>
        </div>;
    }
}

export default Sidebar;

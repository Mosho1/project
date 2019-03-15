import * as React from "react"
import { observer } from "mobx-react"
import * as styles from './styles/topbar.css';
import Component from './component';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import compileToJS from '../stores/compilers/javascript';
import { download } from '../utils/download';
import compileToPython from '../stores/compilers/python';

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

    compileToJs = () => {
        download(this.store.name + '.js', compileToJS(this.store.boxes));
    }

    compileToPython = () => {
        download(this.store.name + '.py', compileToPython(this.store.boxes));
    }

    get isRunning() {
        const { running } = this.store;
        return running;
    }

    get runDisabled() {
        const { running, breakpointCallback } = this.store;
        return Boolean(running && !breakpointCallback);
    }

    render() {
        return <div ref={ref => this.topbar = ref}>
            <AppBar className={`${styles.topbar}`}>
                <Toolbar>
                    <Button
                        color="inherit"
                        disabled={this.runDisabled}
                        onClick={this.play}
                        className={styles.button}>
                        {this.isRunning ? 'Resume (F8)' : 'Run (F5)'}
                    </Button>
                    <Button
                        color="inherit"
                        onClick={this.stop}
                        className={styles.button}>
                        Stop (shift + F7)
                    </Button>
                    <Button
                        color="inherit"
                        onClick={this.compileToJs}
                        className={styles.button}>
                        Compile to JS
                    </Button>
                    <Button
                        color="inherit"
                        onClick={this.compileToPython}
                        className={styles.button}>
                        Compile to Python
                    </Button>
                </Toolbar>
            </AppBar>
        </div>;
    }
}

export default Sidebar;

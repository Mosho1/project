import * as React from "react"
import { observer } from "mobx-react"
import * as styles from './styles/index.css';
import Component from './component';
import Drawer from '@material-ui/core/Drawer';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import IconButton from '@material-ui/core/IconButton';
// import Fab from '@material-ui/core/Fab';
import ListIcon from '@material-ui/icons/List';

class ProgramList extends Component {
    sidebar: HTMLDivElement | null = null;
    componentDidMount() {
        if (this.sidebar) this.sidebar.addEventListener('contextmenu', (e: any) => {
            e.stopPropagation();
        });
    }

    onToggleList = () => {
        this.store.ui.programList.toggle();
    };

    render() {
        const { ui, programList } = this.store;
        return <div
            className={`${ui.programList.isOpen ? styles.programListOpen : ''} ${styles.programList}`}
            ref={ref => this.sidebar = ref}>
            <Drawer
                variant="persistent"
                open={ui.programList.isOpen}
                anchor="right"
            >
                <div className={styles.programListListWrapper}>
                    <List className={styles.programListList}>
                        {programList.map(p => <ListItem key={p} button component="a" href={`/${p}`}>{p}</ListItem>)}
                    </List>
                </div>
            </Drawer>
            <div className={styles.programListButton}>
                <IconButton onClick={this.onToggleList}>
                    <ListIcon />
                </IconButton>
            </div>
        </div>;
    }
}

export default observer(ProgramList);
